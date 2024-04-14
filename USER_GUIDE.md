# HireEz - AI Interview Agent
## User Guide

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [User Roles](#2-user-roles)
3. [Dashboard](#3-dashboard)
4. [Job Management](#4-job-management)
5. [Candidate Management](#5-candidate-management)
6. [Pipeline Board](#6-pipeline-board)
7. [Interviews](#7-interviews)
8. [Evaluations](#8-evaluations)
9. [Reports & Analytics](#9-reports--analytics)
10. [User Management](#10-user-management)
11. [Notifications](#11-notifications)
12. [Settings](#12-settings)
13. [Complete Hiring Workflow](#13-complete-hiring-workflow)

---

## 1. Getting Started

### Accessing the Platform

Open your browser and go to **https://hireez.online**

### Logging In

1. Click **Login** on the homepage
2. Enter your **Email** and **Password**
3. Click **Sign In**

You will be redirected to the **Dashboard** after successful login.

### Registering a New Account

1. Click **Register** on the homepage
2. Fill in your **Full Name**, **Email**, and **Password**
3. Click **Create Account**
4. You will be assigned the **Candidate** role by default

> **Note:** Admin and HR Manager accounts are created by the Super Admin through User Management.

---

## 2. User Roles

HireEz has four user roles with different access levels:

| Feature | Super Admin | HR Manager | Interviewer | Candidate |
|---|:---:|:---:|:---:|:---:|
| Dashboard | Yes | Yes | Yes | - |
| Jobs (Create/Edit) | Yes | Yes | - | - |
| Candidates (Register) | Yes | Yes | - | - |
| Pipeline Board | Yes | Yes | - | - |
| Schedule Interviews | Yes | Yes | Yes | - |
| Conduct Interviews | - | - | - | Yes |
| View Evaluations | Yes | Yes | - | - |
| Reports & Export | Yes | Yes | - | - |
| Analytics | Yes | Yes | - | - |
| User Management | Yes | Yes | - | - |
| Domain Management | Yes | - | - | - |
| Settings | Yes | Yes | - | - |

---

## 3. Dashboard

The Dashboard is the landing page after login. It provides a quick overview of your hiring activity.

### KPI Cards (Top Row)

| KPI | Description |
|---|---|
| **Total Candidates** | Number of candidates registered in the system |
| **Active Jobs** | Jobs currently open for hiring |
| **Completed** | Total interviews that have been completed |
| **Pending Reviews** | Evaluations awaiting HR decision |
| **Avg. Score** | Average overall interview score across all evaluations |
| **Completion %** | Percentage of scheduled interviews that were completed |

### Charts

- **Hiring Trends (30 days)** - Line chart showing daily interview activity over the last 30 days
- **Candidate Status Distribution** - Bar chart showing how many candidates are in each pipeline stage
- **Interview Completion** - Donut chart showing completed vs scheduled vs cancelled interviews
- **Time to Hire by Job** - Horizontal bar chart showing average days from registration to hire per job

### Upcoming Interviews

Lists the next scheduled interviews with date/time and status.

---

## 4. Job Management

Navigate to **Jobs** in the sidebar.

### Viewing Jobs

- See all job descriptions in a list view
- **Search** by job title using the search bar
- **Filter** by status (Open, Draft, Closed, On Hold), domain, or department

### Creating a Job

1. Click **Create Job** (top-right button)
2. Fill in the form:

| Field | Required | Description |
|---|---|---|
| Title | Yes | Job title (e.g., "Senior Nurse") |
| Description | Yes | Detailed job description |
| Requirements | No | Skills and qualifications needed |
| Required Skills | No | Comma-separated list of must-have skills |
| Preferred Skills | No | Nice-to-have skills |
| Min Experience | No | Minimum years of experience |
| Max Experience | No | Maximum years of experience |
| Min Salary | No | Starting salary range |
| Max Salary | No | Upper salary range |
| Location | No | Work location |
| Employment Type | No | Full-time, Part-time, Contract, etc. |
| Domain | No | Industry domain (Healthcare, Finance, etc.) |
| Department | No | Organizational department |
| Number of Openings | No | How many positions to fill |

3. Click **Create Job**

### Job Statuses

| Status | Meaning |
|---|---|
| **Draft** | Job not yet published |
| **Open** | Actively accepting candidates |
| **On Hold** | Temporarily paused |
| **Closed** | No longer accepting candidates |

### Viewing Job Details

Click any job in the list to see its full details, requirements, and associated candidates.

---

## 5. Candidate Management

Navigate to **Candidates** in the sidebar.

### Viewing Candidates

- Browse all candidates in a paginated list
- **Search** by name or email
- **Filter** by status or job

### Registering a Candidate

1. Click **Register Candidate**
2. **Upload Resume** (PDF or DOCX) - the AI will automatically parse and extract:
   - Full Name, Email, Phone
   - Address, Date of Birth
   - LinkedIn and Portfolio URLs
   - Experience years, Education
   - Skills
   - Work experience history
3. Review and edit the auto-filled fields
4. Select the **Job** the candidate is applying for
5. Click **Register**

> **Tip:** If AI parsing doesn't extract all fields correctly, you can manually edit them before submitting.

### Candidate Statuses

Each candidate progresses through these stages:

| Status | Description |
|---|---|
| **Registered** | Newly added to the system |
| **Screened** | Resume has been screened by AI |
| **Shortlisted** | Passed screening, approved by HR |
| **Interview Scheduled** | Interview date/time has been set |
| **Interviewed** | Interview completed |
| **Evaluated** | AI evaluation scores generated |
| **Offered** | Job offer extended |
| **Hired** | Candidate accepted and hired |
| **Rejected** | Application declined |

### Candidate Detail Page

Click any candidate to view their full profile:
- Personal information and contact details
- Resume and parsed data
- Skills and work experience
- Current status and pipeline stage
- Screening results (if screened)
- Interview history
- Evaluation results

---

## 6. Pipeline Board

Navigate to **Pipeline** in the sidebar.

The Pipeline provides a **Kanban-style board** for visual candidate tracking.

### How to Use

- Each **column** represents a candidate status (Registered, Screened, Shortlisted, etc.)
- Each **card** shows a candidate's name, email, and job
- **Drag and drop** a candidate card between columns to change their status
- Use the **Job filter** dropdown to view candidates for a specific job
- Use the **Search bar** to find specific candidates

### Key Behaviors

- Moving a candidate to **Screened** or **Shortlisted** automatically sends login credentials to the candidate via email
- Status changes are instant (optimistic updates) and will roll back if the server update fails
- All 9 pipeline stages are visible as columns

---

## 7. Interviews

Navigate to **Interviews** in the sidebar.

### Viewing Interviews

- See all interviews in a list view
- Filter by **status** (Scheduled, In Progress, Completed, Cancelled, Expired)
- Filter by **type** (AI Chat, AI Voice, Both)

### Scheduling an Interview

1. Click **Schedule Interview**
2. Fill in:

| Field | Description |
|---|---|
| **Candidate** | Select from registered candidates |
| **Job** | Select the job for the interview |
| **Interview Type** | AI Chat, AI Voice, or Both |
| **Duration** | Duration limit in minutes (default: 30) |
| **Language** | Interview language (default: English) |

3. Click **Schedule**

### Interview Types

| Type | Description |
|---|---|
| **AI Chat** | Text-based interview. AI asks questions via text, candidate types answers |
| **AI Voice** | Voice-based interview. AI speaks questions, candidate responds via microphone |
| **AI Both** | Combined chat and voice. Candidate can choose to type or speak |

### Conducting an Interview (Candidate View)

1. Log in to HireEz
2. Go to **Interviews** to see your scheduled interviews
3. Click on an interview, then click **Start Interview**
4. The AI interviewer will:
   - Greet you and explain the process
   - Ask domain-specific questions one at a time
   - Follow up based on your answers
   - Track time remaining
5. Answer questions by typing (Chat mode) or speaking (Voice mode)
6. The interview ends automatically when time runs out, or you can end it manually
7. A full transcript is saved for review

### Interview Room Features

- **Timer** showing remaining time
- **Conversation history** displaying the full chat
- **Webcam toggle** (optional)
- **Microphone input** for voice interviews
- **Text input** for chat interviews
- **End Interview** button to finish early

---

## 8. Evaluations

After an interview is completed, AI generates an evaluation.

### Viewing an Evaluation

Navigate to an evaluation from the interview detail page or candidate detail page.

### Score Breakdown

Each evaluation includes **5 dimension scores** on a 0-10 scale:

| Score | What It Measures |
|---|---|
| **Communication** | Clarity, articulation, listening skills |
| **Technical** | Domain expertise and technical depth |
| **Confidence** | Self-assurance and conviction in answers |
| **Domain Knowledge** | Subject matter expertise for the specific role |
| **Problem Solving** | Analytical ability and solution approach |
| **Overall Score** | Weighted average of all dimensions |

### AI Recommendation

Based on the scores, the AI provides a recommendation:

| Recommendation | Meaning |
|---|---|
| **Strongly Hire** | Excellent candidate, highly recommended |
| **Hire** | Good candidate, recommended |
| **Maybe** | Average performance, needs further review |
| **No Hire** | Below expectations, not recommended |

### HR Decision

After reviewing the AI evaluation, HR makes the final decision:

| Decision | Action |
|---|---|
| **Approve** | Proceed with job offer |
| **Reject** | Decline the candidate |
| **On Hold** | Defer decision for later |

HR can also add **notes** to explain their decision.

### Evaluation Visualizations

- **Radar chart** showing all 5 score dimensions
- **Progress bars** for each individual score
- **Strengths** identified by AI (bulleted list)
- **Areas for Improvement** identified by AI (bulleted list)
- **Detailed Feedback** - narrative summary from AI

---

## 9. Reports & Analytics

### Reports Page

Navigate to **Reports** in the sidebar.

Download data as Excel spreadsheets or PDF:

| Report | Format | Contents |
|---|---|---|
| **Candidates Report** | Excel (.xlsx) | All candidates with name, email, phone, job, experience, status, registration date |
| **Evaluations Report** | Excel (.xlsx) | All evaluations with scores, AI recommendation, HR decision |
| **Evaluation PDF** | PDF | Individual evaluation report with scores and feedback (enter Evaluation ID) |

### Analytics Page

Navigate to **Analytics** in the sidebar.

#### Charts

1. **Time to Hire by Job** (full-width bar chart)
   - Shows average number of days from candidate registration to hire
   - Grouped by job title
   - Hover to see hire count

2. **Interview Completion** (donut chart)
   - Shows breakdown: Completed (green), Scheduled (blue), Cancelled (red)
   - Center displays completion rate percentage

3. **Score Distribution** (histogram)
   - Shows how many candidates scored in each range (0-2, 2-4, 4-6, 6-8, 8-10)
   - Use the **Job filter dropdown** to view scores for a specific job

#### Export Pipeline

Click the **Export Pipeline** button (top-right) to download a comprehensive Excel report containing:

| Column | Description |
|---|---|
| ID | Candidate ID |
| Name | Full name |
| Email | Email address |
| Phone | Phone number |
| Job | Job title applied for |
| Status | Current pipeline status |
| Experience (yrs) | Years of experience |
| Communication | Communication score |
| Technical | Technical score |
| Confidence | Confidence score |
| Domain Knowledge | Domain knowledge score |
| Problem Solving | Problem solving score |
| Overall Score | Overall evaluation score |
| AI Recommendation | AI hiring recommendation |
| Registered | Registration date |
| Days in Pipeline | Number of days since registration |

---

## 10. User Management

Navigate to **Users** in the sidebar (Super Admin / HR Manager only).

### Viewing Users

- Browse all users with pagination
- **Search** by name or email
- **Filter** by role (Super Admin, HR Manager, Interviewer, Candidate)
- **Filter** by status (Active / Inactive)

### Creating a User

1. Click **Create User**
2. Fill in:
   - **Full Name** (required)
   - **Email** (required, must be unique)
   - **Password** (required)
   - **Role** (Super Admin, HR Manager, Interviewer, or Candidate)
   - **Phone** (optional)
   - **Department** (optional)
3. Click **Create**

### Editing a User

1. Click on a user in the list
2. Update any fields (name, email, phone, role, department)
3. Click **Save**

### Activating / Deactivating Users

- Toggle user active status to enable or disable their access
- Deactivated users cannot log in

---

## 11. Notifications

Click the **bell icon** in the top header bar to view notifications.

### Notification Types

| Type | When It's Sent |
|---|---|
| **Interview Invite** | When an interview is scheduled for a candidate |
| **Interview Reminder** | Before a scheduled interview |
| **Evaluation Result** | When an evaluation is completed |
| **Status Update** | When a candidate's status changes |
| **Offer Letter** | When an offer is extended |

### Managing Notifications

- Unread notifications show with a **highlighted background**
- Click **Mark Read** to dismiss individual notifications
- The unread count is displayed at the top of the page

---

## 12. Settings

Navigate to **Settings** in the sidebar.

### Domains

View the 32 non-IT industry domains organized by sector:

- **Healthcare** - Nursing, Medical, Pharmacy, etc.
- **Finance** - Banking, Insurance, Accounting, etc.
- **Manufacturing** - Production, Quality, Supply Chain, etc.
- **Logistics** - Warehousing, Transportation, etc.
- **Engineering** - Civil, Mechanical, Electrical, etc.
- And more...

Each domain comes with **25+ pre-seeded interview questions** covering different difficulty levels and question types (technical, behavioral, situational).

**Total: 800+ industry-specific interview questions**

### Domain Management (Super Admin)

Super Admins can view domain details including:
- Domain name and description
- Associated sector
- Number of questions in the question bank

---

## 13. Complete Hiring Workflow

Here's the end-to-end flow for hiring a candidate:

### Step 1: Create a Job

1. Go to **Jobs** > **Create Job**
2. Fill in job details, domain, and requirements
3. Set status to **Open**

### Step 2: Register a Candidate

1. Go to **Candidates** > **Register Candidate**
2. Upload the candidate's resume
3. AI extracts candidate data automatically
4. Assign to the open job
5. Submit registration

### Step 3: Screen the Resume

1. View the candidate's profile
2. Trigger **AI Resume Screening**
3. AI analyzes the resume against job requirements
4. Review screening scores:
   - Keyword Match, Skill Relevance, Experience Match, Education Match
5. Move candidate to **Screened** (system auto-emails login credentials)

### Step 4: Shortlist

1. Go to **Pipeline** board
2. Review screened candidates
3. Drag promising candidates to **Shortlisted**

### Step 5: Schedule Interview

1. Go to **Interviews** > **Schedule Interview**
2. Select the shortlisted candidate and job
3. Choose interview type (Chat, Voice, or Both)
4. Set duration and language
5. Click **Schedule**
6. Candidate receives notification

### Step 6: Candidate Takes Interview

1. Candidate logs in to HireEz
2. Views their scheduled interview
3. Clicks **Start Interview**
4. AI conducts the interview with domain-specific questions
5. Candidate answers via text or voice
6. Interview auto-completes after time limit

### Step 7: Review Evaluation

1. After interview completion, AI generates evaluation
2. Go to the evaluation page
3. Review:
   - Score radar chart and breakdowns
   - AI recommendation (Strongly Hire / Hire / Maybe / No Hire)
   - Identified strengths and weaknesses
   - Detailed feedback
4. Make HR decision: **Approve**, **Reject**, or **On Hold**
5. Add any notes

### Step 8: Make Offer & Hire

1. If approved, move candidate to **Offered** in the Pipeline
2. Once offer is accepted, move to **Hired**
3. The candidate journey is complete

### Step 9: Export Reports

1. Go to **Reports** to download Excel/PDF reports
2. Go to **Analytics** to view charts and export pipeline data
3. Share with stakeholders as needed

---

## Tips & Best Practices

- **Use the Pipeline board** for a visual overview of all candidates across stages
- **Filter by job** in Analytics and Pipeline to focus on specific openings
- **Export Pipeline reports** before stakeholder meetings for data-driven discussions
- **Review AI recommendations** carefully - they are suggestions, not final decisions
- **Add HR notes** to evaluations to document your reasoning for future reference
- **Keep jobs updated** - close filled positions and archive old listings
- **Check the Dashboard daily** for pending reviews and upcoming interviews

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Can't log in | Check email/password. Contact your admin if account is deactivated |
| Page shows "Loading..." indefinitely | Refresh the browser. Check internet connection |
| Interview room not connecting | Ensure microphone/camera permissions are granted in browser |
| Voice not recognized | Speak clearly, check microphone is not muted, try Chrome browser |
| Export not downloading | Check browser popup blocker. Try a different browser |
| Candidate didn't receive credentials | Verify email address. Check spam folder. Re-trigger from Pipeline |

---

*HireEz - AI-Powered Interview Platform*
*https://hireez.online*
