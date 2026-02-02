# Pacific Coast Title - Sales Rep Tool Competency Assessment

## Integration Documentation

This document provides all the details needed to integrate the Sales Rep Tool Competency Assessment into another system.

---

## Table of Contents

1. [Overview](#overview)
2. [Respondent Information](#respondent-information)
3. [Assessment Questions by Tool](#assessment-questions-by-tool)
4. [Confidence Ratings](#confidence-ratings)
5. [Score Calculations](#score-calculations)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Data Formats](#data-formats)
9. [Field Reference Tables](#field-reference-tables)

---

## Overview

The Sales Rep Tool Competency Assessment evaluates sales representatives' proficiency with Pacific Coast Title's digital tools. It consists of:

- **33 Yes/No questions** across 7 tools
- **35 confidence ratings** (5 categories × 7 tools, scale 1-5)
- **2 calculated scores**: Capability Score (%) and Average Confidence Score

---

## Respondent Information

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `respondent_name` | String (255 max) | Yes | Full name of the sales rep |
| `respondent_email` | String (255 max) | Yes | Email address |

---

## Assessment Questions by Tool

### Tool 1: Title Profile (Prefix: `tp`)

| Field | Question |
|-------|----------|
| `tp_q1` | Do you know how to access Title Profile? |
| `tp_q2` | Do you know how to set up clients to receive profiles or alerts? |
| `tp_q3` | Can you run property profiles? |
| `tp_q4` | Can you explain profile sections to a client? |
| `tp_q5` | Can you search by APN, owner, or address? |

### Tool 2: Title Tool Box (Prefix: `ttb`)

| Field | Question |
|-------|----------|
| `ttb_q1` | Know how to log in / access |
| `ttb_q2` | Know how to create a client farm |
| `ttb_q3` | Know how to set up client saved searches |
| `ttb_q4` | Can create farm lists |
| `ttb_q5` | Can build targeted lists (NOD, equity, absentee, etc.) |
| `ttb_q6` | Can export lists |

### Tool 3: Pacific Agent ONE (Prefix: `pao`)

| Field | Question |
|-------|----------|
| `pao_q1` | Know how to access & install the app |
| `pao_q2` | Know how to add clients into the app |
| `pao_q3` | Know how to brand the app with their info |
| `pao_q4` | Can generate seller net sheets & buyer estimates |
| `pao_q5` | Can share branded live net sheets with clients |

### Tool 4: PCT Smart Direct (Prefix: `psd`)

| Field | Question |
|-------|----------|
| `psd_q1` | Know how to access Smart Direct |
| `psd_q2` | Can set up new client campaigns |
| `psd_q3` | Can create mailing lists |
| `psd_q4` | Can generate postcards |
| `psd_q5` | Can filter properly (distress, equity, absentee, etc.) |

### Tool 5: PCT Website (Prefix: `pw`)

| Field | Question |
|-------|----------|
| `pw_q1` | Know how to navigate the website |
| `pw_q2` | Know how to set up clients with tools or resources |
| `pw_q3` | Can find all available resources |
| `pw_q4` | Can guide clients through the site |

### Tool 6: Trainings Offered by PCT (Prefix: `tr`)

| Field | Question |
|-------|----------|
| `tr_q1` | Know what trainings are available |
| `tr_q2` | Know how to access training schedules |
| `tr_q3` | Know how to enroll clients in trainings |
| `tr_q4` | Know how to leverage training content |

### Tool 7: Sales Dashboard (Prefix: `sd`)

| Field | Question |
|-------|----------|
| `sd_q1` | Do you know how to access your PCT Sales Dashboard? |
| `sd_q2` | Do you know how to read your numbers? |
| `sd_q3` | Are you checking weekly? (Sales Units, Refi Units, Revenue, Pipeline, Assigned Accounts, Activity Metrics) |
| `sd_q4` | Do you know how to track: Personal goals, Monthly targets, Year-over-year comparison, Daily activity requirements |

---

## Confidence Ratings

For **each tool**, the respondent rates their confidence (1-5 scale) in these 5 categories:

| Category | Field Suffix | Description |
|----------|--------------|-------------|
| Awareness | `_awareness` | General knowledge of the tool |
| Access | `_access` | Know how to access/login |
| Setup | `_setup` | Know how to configure/setup |
| Usage | `_usage` | Proficiency in daily use |
| Need Training | `_need_training` | Self-assessed training need |

### Rating Scale

| Value | Meaning |
|-------|---------|
| 1 | No Knowledge |
| 2 | Basic Awareness |
| 3 | Moderate |
| 4 | Proficient |
| 5 | Expert Level |

### Complete Confidence Fields by Tool

| Tool | Fields |
|------|--------|
| Title Profile | `tp_awareness`, `tp_access`, `tp_setup`, `tp_usage`, `tp_need_training` |
| Title Tool Box | `ttb_awareness`, `ttb_access`, `ttb_setup`, `ttb_usage`, `ttb_need_training` |
| Pacific Agent ONE | `pao_awareness`, `pao_access`, `pao_setup`, `pao_usage`, `pao_need_training` |
| PCT Smart Direct | `psd_awareness`, `psd_access`, `psd_setup`, `psd_usage`, `psd_need_training` |
| PCT Website | `pw_awareness`, `pw_access`, `pw_setup`, `pw_usage`, `pw_need_training` |
| Trainings | `tr_awareness`, `tr_access`, `tr_setup`, `tr_usage`, `tr_need_training` |
| Sales Dashboard | `sd_awareness`, `sd_access`, `sd_setup`, `sd_usage`, `sd_need_training` |

---

## Score Calculations

### Capability Score

```
capability_score = (count of "Yes" answers / 33) × 100
```

- **Range**: 0-100 (percentage)
- **Stored as**: DECIMAL(5,2)

### Average Confidence Score

```
avg_confidence_score = sum of all confidence ratings / 35
```

- **Range**: 1.00-5.00
- **Stored as**: DECIMAL(3,2)

---

## Database Schema

### PostgreSQL Table: `responses`

```sql
CREATE TABLE responses (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Respondent Info
    respondent_name VARCHAR(255) NOT NULL,
    respondent_email VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Title Profile Questions (5)
    tp_q1 BOOLEAN,
    tp_q2 BOOLEAN,
    tp_q3 BOOLEAN,
    tp_q4 BOOLEAN,
    tp_q5 BOOLEAN,
    
    -- Title Tool Box Questions (6)
    ttb_q1 BOOLEAN,
    ttb_q2 BOOLEAN,
    ttb_q3 BOOLEAN,
    ttb_q4 BOOLEAN,
    ttb_q5 BOOLEAN,
    ttb_q6 BOOLEAN,
    
    -- Pacific Agent ONE Questions (5)
    pao_q1 BOOLEAN,
    pao_q2 BOOLEAN,
    pao_q3 BOOLEAN,
    pao_q4 BOOLEAN,
    pao_q5 BOOLEAN,
    
    -- PCT Smart Direct Questions (5)
    psd_q1 BOOLEAN,
    psd_q2 BOOLEAN,
    psd_q3 BOOLEAN,
    psd_q4 BOOLEAN,
    psd_q5 BOOLEAN,
    
    -- PCT Website Questions (4)
    pw_q1 BOOLEAN,
    pw_q2 BOOLEAN,
    pw_q3 BOOLEAN,
    pw_q4 BOOLEAN,
    
    -- Trainings Questions (4)
    tr_q1 BOOLEAN,
    tr_q2 BOOLEAN,
    tr_q3 BOOLEAN,
    tr_q4 BOOLEAN,
    
    -- Sales Dashboard Questions (4)
    sd_q1 BOOLEAN,
    sd_q2 BOOLEAN,
    sd_q3 BOOLEAN,
    sd_q4 BOOLEAN,
    
    -- Title Profile Confidence Ratings
    tp_awareness INT CHECK (tp_awareness BETWEEN 1 AND 5),
    tp_access INT CHECK (tp_access BETWEEN 1 AND 5),
    tp_setup INT CHECK (tp_setup BETWEEN 1 AND 5),
    tp_usage INT CHECK (tp_usage BETWEEN 1 AND 5),
    tp_need_training INT CHECK (tp_need_training BETWEEN 1 AND 5),
    
    -- Title Tool Box Confidence Ratings
    ttb_awareness INT CHECK (ttb_awareness BETWEEN 1 AND 5),
    ttb_access INT CHECK (ttb_access BETWEEN 1 AND 5),
    ttb_setup INT CHECK (ttb_setup BETWEEN 1 AND 5),
    ttb_usage INT CHECK (ttb_usage BETWEEN 1 AND 5),
    ttb_need_training INT CHECK (ttb_need_training BETWEEN 1 AND 5),
    
    -- Pacific Agent ONE Confidence Ratings
    pao_awareness INT CHECK (pao_awareness BETWEEN 1 AND 5),
    pao_access INT CHECK (pao_access BETWEEN 1 AND 5),
    pao_setup INT CHECK (pao_setup BETWEEN 1 AND 5),
    pao_usage INT CHECK (pao_usage BETWEEN 1 AND 5),
    pao_need_training INT CHECK (pao_need_training BETWEEN 1 AND 5),
    
    -- PCT Smart Direct Confidence Ratings
    psd_awareness INT CHECK (psd_awareness BETWEEN 1 AND 5),
    psd_access INT CHECK (psd_access BETWEEN 1 AND 5),
    psd_setup INT CHECK (psd_setup BETWEEN 1 AND 5),
    psd_usage INT CHECK (psd_usage BETWEEN 1 AND 5),
    psd_need_training INT CHECK (psd_need_training BETWEEN 1 AND 5),
    
    -- PCT Website Confidence Ratings
    pw_awareness INT CHECK (pw_awareness BETWEEN 1 AND 5),
    pw_access INT CHECK (pw_access BETWEEN 1 AND 5),
    pw_setup INT CHECK (pw_setup BETWEEN 1 AND 5),
    pw_usage INT CHECK (pw_usage BETWEEN 1 AND 5),
    pw_need_training INT CHECK (pw_need_training BETWEEN 1 AND 5),
    
    -- Trainings Confidence Ratings
    tr_awareness INT CHECK (tr_awareness BETWEEN 1 AND 5),
    tr_access INT CHECK (tr_access BETWEEN 1 AND 5),
    tr_setup INT CHECK (tr_setup BETWEEN 1 AND 5),
    tr_usage INT CHECK (tr_usage BETWEEN 1 AND 5),
    tr_need_training INT CHECK (tr_need_training BETWEEN 1 AND 5),
    
    -- Sales Dashboard Confidence Ratings
    sd_awareness INT CHECK (sd_awareness BETWEEN 1 AND 5),
    sd_access INT CHECK (sd_access BETWEEN 1 AND 5),
    sd_setup INT CHECK (sd_setup BETWEEN 1 AND 5),
    sd_usage INT CHECK (sd_usage BETWEEN 1 AND 5),
    sd_need_training INT CHECK (sd_need_training BETWEEN 1 AND 5),
    
    -- Calculated Scores
    capability_score DECIMAL(5,2),
    avg_confidence_score DECIMAL(3,2)
);
```

---

## API Endpoints

### Base URL
```
https://questions-rust.vercel.app/api/responses
```

### POST - Submit Assessment

**Endpoint:** `POST /api/responses`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "respondentName": "John Smith",
  "respondentEmail": "john.smith@example.com",
  "responses": {
    "title-profile": {
      "q1": true,
      "q2": false,
      "q3": true,
      "q4": true,
      "q5": false
    },
    "title-toolbox": {
      "q1": true,
      "q2": true,
      "q3": false,
      "q4": true,
      "q5": false,
      "q6": true
    },
    "pacific-agent-one": {
      "q1": true,
      "q2": false,
      "q3": false,
      "q4": true,
      "q5": true
    },
    "pct-smart-direct": {
      "q1": true,
      "q2": true,
      "q3": true,
      "q4": false,
      "q5": false
    },
    "pct-website": {
      "q1": true,
      "q2": true,
      "q3": true,
      "q4": true
    },
    "trainings": {
      "q1": true,
      "q2": false,
      "q3": false,
      "q4": true
    },
    "sales-dashboard": {
      "q1": true,
      "q2": true,
      "q3": false,
      "q4": false
    }
  },
  "confidenceRatings": {
    "title-profile": {
      "awareness": 4,
      "access": 4,
      "setup": 3,
      "usage": 4,
      "needTraining": 2
    },
    "title-toolbox": {
      "awareness": 3,
      "access": 3,
      "setup": 2,
      "usage": 3,
      "needTraining": 3
    },
    "pacific-agent-one": {
      "awareness": 4,
      "access": 4,
      "setup": 3,
      "usage": 3,
      "needTraining": 2
    },
    "pct-smart-direct": {
      "awareness": 3,
      "access": 3,
      "setup": 2,
      "usage": 2,
      "needTraining": 4
    },
    "pct-website": {
      "awareness": 5,
      "access": 5,
      "setup": 4,
      "usage": 5,
      "needTraining": 1
    },
    "trainings": {
      "awareness": 3,
      "access": 2,
      "setup": 2,
      "usage": 2,
      "needTraining": 4
    },
    "sales-dashboard": {
      "awareness": 4,
      "access": 4,
      "setup": 3,
      "usage": 3,
      "needTraining": 2
    }
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "id": 42,
  "submittedAt": "2026-02-02T15:30:00.000Z",
  "scores": {
    "capability": 58,
    "capabilityRaw": "19/33",
    "confidence": "3.1"
  }
}
```

**Error Response:**
```json
{
  "error": "Name and email required"
}
```

### GET - Retrieve Responses

**Endpoint:** `GET /api/responses`

**Query Parameters:**
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | int | 50 | 100 | Number of records to return |
| `offset` | int | 0 | - | Records to skip (pagination) |

**Example:**
```
GET /api/responses?limit=25&offset=0
```

**Response:**
```json
{
  "responses": [
    {
      "id": 42,
      "respondent_name": "John Smith",
      "respondent_email": "john.smith@example.com",
      "submitted_at": "2026-02-02T15:30:00.000Z",
      "tp_q1": true,
      "tp_q2": false,
      "tp_q3": true,
      "tp_q4": true,
      "tp_q5": false,
      "ttb_q1": true,
      "...": "...",
      "tp_awareness": 4,
      "tp_access": 4,
      "...": "...",
      "capability_score": "57.58",
      "avg_confidence_score": "3.11"
    }
  ],
  "total": 156
}
```

---

## Data Formats

### Tool Key Mapping

| API Tool Key | Database Prefix | Tool Name |
|--------------|-----------------|-----------|
| `title-profile` | `tp` | Title Profile |
| `title-toolbox` | `ttb` | Title Tool Box |
| `pacific-agent-one` | `pao` | Pacific Agent ONE |
| `pct-smart-direct` | `psd` | PCT Smart Direct |
| `pct-website` | `pw` | PCT Website |
| `trainings` | `tr` | Trainings Offered by PCT |
| `sales-dashboard` | `sd` | Sales Dashboard |

### Confidence Category Mapping

| API Key | Database Suffix |
|---------|-----------------|
| `awareness` | `_awareness` |
| `access` | `_access` |
| `setup` | `_setup` |
| `usage` | `_usage` |
| `needTraining` | `_need_training` |

---

## Field Reference Tables

### All Database Fields (68 total)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 1 | `id` | SERIAL | Auto-increment primary key |
| 2 | `respondent_name` | VARCHAR(255) | Full name |
| 3 | `respondent_email` | VARCHAR(255) | Email address |
| 4 | `submitted_at` | TIMESTAMPTZ | Submission timestamp |
| 5-9 | `tp_q1` - `tp_q5` | BOOLEAN | Title Profile questions |
| 10-15 | `ttb_q1` - `ttb_q6` | BOOLEAN | Title Tool Box questions |
| 16-20 | `pao_q1` - `pao_q5` | BOOLEAN | Pacific Agent ONE questions |
| 21-25 | `psd_q1` - `psd_q5` | BOOLEAN | PCT Smart Direct questions |
| 26-29 | `pw_q1` - `pw_q4` | BOOLEAN | PCT Website questions |
| 30-33 | `tr_q1` - `tr_q4` | BOOLEAN | Trainings questions |
| 34-37 | `sd_q1` - `sd_q4` | BOOLEAN | Sales Dashboard questions |
| 38-42 | `tp_awareness` - `tp_need_training` | INT (1-5) | Title Profile confidence |
| 43-47 | `ttb_awareness` - `ttb_need_training` | INT (1-5) | Title Tool Box confidence |
| 48-52 | `pao_awareness` - `pao_need_training` | INT (1-5) | Pacific Agent ONE confidence |
| 53-57 | `psd_awareness` - `psd_need_training` | INT (1-5) | PCT Smart Direct confidence |
| 58-62 | `pw_awareness` - `pw_need_training` | INT (1-5) | PCT Website confidence |
| 63-67 | `tr_awareness` - `tr_need_training` | INT (1-5) | Trainings confidence |
| 68-72 | `sd_awareness` - `sd_need_training` | INT (1-5) | Sales Dashboard confidence |
| 73 | `capability_score` | DECIMAL(5,2) | Calculated % (0-100) |
| 74 | `avg_confidence_score` | DECIMAL(3,2) | Calculated avg (1-5) |

---

## Database Connection

**Current Production Database:**
```
Host: dpg-d0o9n43qf0us73a66ddg-a.oregon-postgres.render.com
Database: questions_uzzf
User: questions_uzzf_user
SSL: Required (rejectUnauthorized: false)
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

## Sample Queries

### Get all responses with scores
```sql
SELECT 
    id,
    respondent_name,
    respondent_email,
    submitted_at,
    capability_score,
    avg_confidence_score
FROM responses
ORDER BY submitted_at DESC;
```

### Get responses needing training (low confidence)
```sql
SELECT 
    respondent_name,
    respondent_email,
    avg_confidence_score
FROM responses
WHERE avg_confidence_score < 3.0
ORDER BY avg_confidence_score ASC;
```

### Count Yes responses by tool for a specific user
```sql
SELECT 
    respondent_name,
    (tp_q1::int + tp_q2::int + tp_q3::int + tp_q4::int + tp_q5::int) as title_profile_yes,
    (ttb_q1::int + ttb_q2::int + ttb_q3::int + ttb_q4::int + ttb_q5::int + ttb_q6::int) as title_toolbox_yes,
    (pao_q1::int + pao_q2::int + pao_q3::int + pao_q4::int + pao_q5::int) as pacific_agent_yes,
    (psd_q1::int + psd_q2::int + psd_q3::int + psd_q4::int + psd_q5::int) as smart_direct_yes,
    (pw_q1::int + pw_q2::int + pw_q3::int + pw_q4::int) as website_yes,
    (tr_q1::int + tr_q2::int + tr_q3::int + tr_q4::int) as trainings_yes,
    (sd_q1::int + sd_q2::int + sd_q3::int + sd_q4::int) as dashboard_yes
FROM responses
WHERE id = 42;
```

---

## Live URLs

| Purpose | URL |
|---------|-----|
| Assessment Form | https://questions-rust.vercel.app/ |
| Admin Dashboard | https://questions-rust.vercel.app/admin |
| API Endpoint | https://questions-rust.vercel.app/api/responses |

---

*Document created: February 2, 2026*
*Pacific Coast Title Company*
