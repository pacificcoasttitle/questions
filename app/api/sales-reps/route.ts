import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-title-officer';

// GET - List all sales reps
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';
    const slug = searchParams.get('slug');

    if (slug) {
      // Get single rep by slug
      const result = await query(
        'SELECT * FROM sales_reps WHERE slug = $1',
        [slug]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Sales rep not found' }, { status: 404 });
      }
      return NextResponse.json({ rep: result.rows[0] });
    }

    // Get all reps
    const sql = activeOnly
      ? 'SELECT * FROM sales_reps WHERE is_active = true ORDER BY name'
      : 'SELECT * FROM sales_reps ORDER BY name';
    
    const result = await query(sql);
    return NextResponse.json({ reps: result.rows });
  } catch (error) {
    console.error('Sales reps fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales reps' }, { status: 500 });
  }
}

// POST - Create new sales rep
export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, title } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const result = await query(
      `INSERT INTO sales_reps (name, slug, email, phone, title) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, slug, email, phone || null, title || null]
    );

    return NextResponse.json({ 
      success: true, 
      rep: result.rows[0],
      surveyUrl: `/client/${slug}`
    });
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'A sales rep with this name already exists' }, { status: 400 });
    }
    console.error('Sales rep create error:', error);
    return NextResponse.json({ error: 'Failed to create sales rep' }, { status: 500 });
  }
}

// PATCH - Update sales rep
export async function PATCH(request: NextRequest) {
  try {
    const { id, name, email, phone, title, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name);
      
      // Also update slug if name changes
      const slug = name
        .toLowerCase()
        .replace(/['']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      paramCount++;
      updates.push(`slug = $${paramCount}`);
      values.push(slug);
    }
    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email);
    }
    if (phone !== undefined) {
      paramCount++;
      updates.push(`phone = $${paramCount}`);
      values.push(phone);
    }
    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title);
    }
    if (isActive !== undefined) {
      paramCount++;
      updates.push(`is_active = $${paramCount}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    paramCount++;
    values.push(id);

    const sql = `UPDATE sales_reps SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Sales rep not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, rep: result.rows[0] });
  } catch (error) {
    console.error('Sales rep update error:', error);
    return NextResponse.json({ error: 'Failed to update sales rep' }, { status: 500 });
  }
}

// DELETE - Soft delete (deactivate) sales rep
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await query(
      'UPDATE sales_reps SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Sales rep not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, rep: result.rows[0] });
  } catch (error) {
    console.error('Sales rep delete error:', error);
    return NextResponse.json({ error: 'Failed to delete sales rep' }, { status: 500 });
  }
}
