# Pacific Coast Title - Sales Tool Competency Assessment

A web-based assessment tool for evaluating sales representatives' proficiency with Pacific Coast Title's digital tools and resources.

## Overview

This application allows sales representatives to complete a self-assessment questionnaire covering 7 key tools used at Pacific Coast Title. The system collects responses, calculates competency scores, and provides an admin dashboard for reviewing submissions.

## Features

### Survey (`/`)
- **Multi-step wizard interface** - Guides users through the assessment
- **7 Tool Categories** with specific questions:
  1. **Title Profile** (5 questions) - Property profile access and usage
  2. **Title Tool Box** (6 questions) - Farm lists and targeted searches
  3. **Pacific Agent ONE** (5 questions) - Mobile app proficiency
  4. **PCT Smart Direct** (5 questions) - Direct mail campaigns
  5. **PCT Website** (4 questions) - Website navigation and resources
  6. **Trainings** (4 questions) - Training awareness and enrollment
  7. **Sales Dashboard** (4 questions) - Performance tracking
- **Confidence Ratings** - 1-5 scale for Awareness, Access, Setup, Usage, and Training needs
- **Automatic Score Calculation**:
  - Capability Score: Percentage of "Yes" answers (out of 33 questions)
  - Confidence Score: Average of all confidence ratings

### Admin Dashboard (`/admin`)
- View all submitted responses
- Summary cards showing Capability % and Confidence scores
- **Expandable detail view** for each response:
  - Individual question responses (Yes/No) per tool
  - Confidence ratings per tool category
  - Color-coded indicators for quick assessment

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (hosted on Render)
- **Deployment**: Vercel
- **UI Components**: Radix UI + shadcn/ui

## Database Schema

```sql
CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    respondent_name VARCHAR(255) NOT NULL,
    respondent_email VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Question responses (boolean)
    tp_q1-q5, ttb_q1-q6, pao_q1-q5, psd_q1-q5, 
    pw_q1-q4, tr_q1-q4, sd_q1-q4,
    
    -- Confidence ratings (1-5 integer)
    [prefix]_awareness, [prefix]_access, [prefix]_setup, 
    [prefix]_usage, [prefix]_need_training,
    
    -- Calculated scores
    capability_score DECIMAL(5,2),
    avg_confidence_score DECIMAL(3,2)
);
```

## API Endpoints

### POST `/api/responses`
Submit a new assessment response.

**Request Body:**
```json
{
  "respondentName": "John Smith",
  "respondentEmail": "john@example.com",
  "responses": {
    "title-profile": { "q1": true, "q2": false, ... },
    ...
  },
  "confidenceRatings": {
    "title-profile": { "awareness": 4, "access": 3, ... },
    ...
  }
}
```

### GET `/api/responses`
Retrieve all responses (for admin dashboard).

**Query Parameters:**
- `limit` (default: 50, max: 100)
- `offset` (default: 0)

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
├── app/
│   ├── api/responses/route.ts   # API endpoints
│   ├── admin/page.tsx           # Admin dashboard
│   ├── page.tsx                  # Main survey wizard
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── lib/
│   └── db.ts                    # PostgreSQL connection
├── components/ui/               # shadcn/ui components
└── scripts/
    └── create-table.js          # Database setup script
```

## Deployment

The application is configured for automatic deployment on Vercel:
1. Push to `main` branch triggers deployment
2. Environment variable `DATABASE_URL` must be set in Vercel dashboard

## Repository

GitHub: https://github.com/pacificcoasttitle/questions

---

*Built for Pacific Coast Title Company*

