# NuruPath AI

**Lighting the Path from Learning to Livelihood**

AI-powered career navigation platform helping Kenyan secondary school students, TVET learners, recent graduates, and unemployed youth identify education-to-employment pathways.

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env
# Edit .env with your Supabase and OpenAI credentials

# Run the development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TypeScript, TailwindCSS, Shadcn UI |
| Backend | Next.js API Routes, TypeScript |
| Database | PostgreSQL (Supabase), Row Level Security |
| Auth | Supabase Auth (email/password) |
| AI | OpenAI GPT-4o-mini, Multi-Agent Architecture |
| Deployment | Vercel |

---

## Architecture

### Multi-Agent System (RANK/HUNT/GUARD)

```
Learner Profile
      |
  [Scout Agent] ---- validate profile, check consent, flag incomplete data
      |
      | HUNT Handoff: 90%+ profile completeness, consent verified
      v
  [Pathfinder Agent] ---- generate career pathways
      |
      | HUNT Handoff: 3+ validated pathways
      v
  [Scholarship Agent] ---- match funding opportunities
      |
      | HUNT Handoff: verified funding matches
      v
  [Skills Agent] ---- analyze skills gaps, generate roadmap
      |
      | HUNT Handoff: complete gap analysis + roadmap
      v
  [Guardian Agent] ---- ethics review, bias check, safety gate
      |
      | APPROVED: deliver to learner
      | REJECTED: escalate to counselor
      | KILLED: halt processing, notify admin
      v
  Final Recommendation
```

### RANK: Role, Authority, Notification, Kill Switch

Each agent operates under strict RANK governance:

| Agent | Role | Authority | Kill Switch Triggers |
|-------|------|-----------|---------------------|
| Scout | Profile analysis | analyze_profile, flag_incomplete | missing_consent, data_integrity |
| Pathfinder | Career pathways | generate_pathways, recommend_institutions | low_confidence, data_integrity |
| Scholarship | Funding matches | match_scholarships, verify_eligibility | data_integrity, safety_threshold |
| Skills | Gap analysis | analyze_gaps, generate_roadmap | data_integrity |
| Guardian | Safety gate | approve, reject, escalate, pause, modify | bias_detected, safety, compliance, dignity |

### HUNT: Handoff Validation

Agents can only hand off to the next agent when validation criteria are met:

- **Scout -> Pathfinder**: 90%+ profile completeness, consent verified, confidence > 0.6
- **Pathfinder -> Scholarship**: 3+ validated pathways, confidence > 0.5
- **Scholarship -> Skills**: verified funding matches, confidence > 0.4
- **Skills -> Guardian**: complete analysis + roadmap, confidence > 0.4
- **Guardian -> Final**: ethics/safety/bias/compliance checks pass, confidence > 0.7

### GUARD: Guardrails, Pattern Detection, Audit, Dignity

**Guardrails Enforced:**
- No ethnicity-based recommendations
- No religion-based recommendations
- No political-based recommendations
- No gender stereotyping
- Confidence scores required on all outputs
- Human review for high-impact decisions
- Never expose personal identifiers
- Dignity preservation: no shaming, no stereotypes, no removal of agency

**Pattern Detection:**
- Recommendation spikes (abnormal volume)
- Bias patterns across outputs
- Confidence drift (declining scores)
- Data anomalies
- Scholarship fraud indicators

**Audit Trail:**
Every agent action is logged with:
- Agent name, action, input/output summaries
- Confidence scores, reasoning
- Duration, flags, governance status
- Immutable audit records

---

## Ethical Frameworks

### TRACK
- **T**raining Data: Documented and reviewed
- **R**epresentation: Diverse Kenyan contexts represented
- **A**mplification: Positive outcomes amplified
- **C**ounterfactuals: Alternative pathways always presented
- **K**ill Switch: Immediate halt capability on any agent

### OASIS
- **O**pt-in by Design: Consent required before any processing
- **A**nonymization Depth: Personal data minimized in AI prompts
- **S**overeignty First: Users own their data
- **I**ntentional Retention: Data kept only with purpose
- **S**ecurity as Ritual: Encryption, RLS, access controls

### ETHOS
- **E**mpathy: Supportive, respectful language
- **T**ransparency: Clear reasoning on all outputs
- **H**uman Impact: Consider life decisions affected
- **O**wnership: Learner retains choice always
- **S**overeignty: Data and context respected

### PRIDE
- **P**ause Points: Critical decisions require human review
- **R**eview Cadence: Regular output quality checks
- **I**nterpretability: All AI outputs explainable
- **D**isagreement Rights: Users can reject any recommendation
- **E**lders Council: Counselor override authority

### HORIZON
- **H**istorical Harm: Avoid perpetuating past inequities
- **O**pportunity Cost: Consider what learners might miss
- **R**ipple Effects: Consider broader community impact
- **I**ntergenerational: Consider long-term effects
- **Z**ero-Sum Traps: Always present multiple pathways
- **O**pen Futures: Never close doors
- **N**on-Human: Consider environmental impact

---

## Project Structure

```
nurupath-ai/
  app/
    page.tsx                    # Homepage
    layout.tsx                  # Root layout with AuthProvider
    globals.css                 # Custom theme (green/gold)
    about/page.tsx              # About page
    assessment/page.tsx         # 15-question career assessment
    dashboard/page.tsx          # Student dashboard with notifications
    scholarships/page.tsx       # AI scholarship matcher
    skills-gap/page.tsx         # Skills gap analysis
    action-plan/page.tsx        # 30/90/365-day action plan + PDF export
    counselor/page.tsx          # Counselor portal
    profile/page.tsx            # User profile management
    admin/page.tsx              # Admin portal with governance data
    onboarding/page.tsx         # 5-step onboarding wizard
    auth/
      signin/page.tsx           # Sign in
      signup/page.tsx           # Sign up with consent
    api/
      onboarding/route.ts      # POST /api/onboarding
      assessment/route.ts      # POST/GET /api/assessment
      career-analysis/route.ts  # POST /api/career-analysis
      scholarships/route.ts    # POST /api/scholarships
      skills-gap/route.ts      # POST /api/skills-gap
      action-plan/route.ts     # POST /api/action-plan
      dashboard/route.ts       # GET /api/dashboard
  lib/
    ai-agents.ts               # Multi-agent AI system (Scout, Pathfinder, Scholarship, Skills, Guardian, Action Plan)
    governance.ts              # RANK/HUNT/GUARD orchestration
    i18n.ts                    # English/Swahili translations
    auth-context.tsx            # Auth state management
    supabase.ts                # Supabase client
    supabase-server.ts          # Server-side Supabase client
    types.ts                   # TypeScript types
    constants.ts               # Kenyan data, assessment questions, seed data
    utils.ts                   # Utility functions
  components/
    layout/navbar.tsx           # Navigation with role-based links
    layout/footer.tsx           # Footer
    ui/                         # Shadcn UI components
  supabase/migrations/          # Database schema migrations
```

---

## Database Schema

### Core Tables
- **profiles** - User onboarding data (name, age, county, education, interests, skills, constraints)
- **assessments** - Career assessment responses and results
- **career_recommendations** - AI-generated career pathways
- **scholarship_matches** - Scholarship matching results
- **skills_reports** - Skills gap analysis reports
- **action_plans** - Career action plans (30/90/365-day)
- **counselor_notes** - Counselor feedback on recommendations
- **audit_logs** - Immutable system audit trail
- **consent_records** - User consent tracking (OASIS)

### Governance Tables
- **notifications** - Counselor/admin alerts for agent events
- **handoff_records** - HUNT workflow validation records
- **kill_switch_events** - Agent halt events with resolution tracking
- **pattern_alerts** - GUARD unusual pattern detection
- **agent_trace** - Full agent execution trace for auditability

All tables have Row Level Security (RLS) enabled with restrictive policies.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/onboarding` | POST | Save user profile |
| `/api/assessment` | POST/GET | Submit/retrieve assessment |
| `/api/career-analysis` | POST | Run full Scout->Pathfinder->Guardian pipeline |
| `/api/scholarships` | POST | Run Scholarship Agent with Guardian review |
| `/api/skills-gap` | POST | Run Skills Agent with Guardian review |
| `/api/action-plan` | POST | Generate action plan with Guardian review |
| `/api/dashboard` | GET | Fetch all dashboard data including notifications |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI
OPENAI_API_KEY=your_openai_api_key
```

---

## Testing Strategy

### Red Team Testing Scenarios

1. **Biased Profile Input**: Submit profiles with ethnicity/religion references to verify guardrails block bias
2. **Adversarial Prompts**: Test assessment responses designed to manipulate career recommendations
3. **Hallucinated Scholarships**: Verify Guardian Agent flags non-existent scholarships
4. **Gender Stereotyping**: Submit profiles designed to elicit gender-biased career paths
5. **Dignity Violations**: Test for shaming language in low-score outputs
6. **Consent Withdrawal**: Verify data processing stops when consent is revoked
7. **Kill Switch Activation**: Test auto-halt on low confidence and missing consent
8. **Handoff Bypass**: Attempt to skip agent stages in the pipeline

### Monitoring & Observability

- **Agent Trace**: Every agent execution logged with confidence, duration, flags
- **Audit Trail**: Immutable logs of all actions, inputs, outputs
- **Pattern Detection**: Automated alerts for recommendation spikes, bias patterns, confidence drift
- **Kill Switch Dashboard**: Unresolved halt events visible in admin portal
- **Consent Tracking**: OASIS-compliant consent and revocation records

---

## Deployment (Vercel)

1. Push to GitHub repository
2. Connect repository in Vercel dashboard
3. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. Deploy - Vercel will auto-detect Next.js

---

## Design System

- **Primary**: Deep green (#16a34a) - growth, Kenya, agriculture
- **Accent**: Gold (#d4a017) - aspiration, achievement, value
- **Background**: White - clarity, professionalism
- **Typography**: Inter - clean, readable, accessible
- **Layout**: 8px spacing system, responsive breakpoints
- **Principle**: Professional, government-ready, NGO-friendly. Not playful.

---

## License

This project is built for Kenyan youth career navigation. All ethical frameworks (TRACK, OASIS, RANK, HUNT, GUARD, ETHOS, PRIDE, HORIZON) are integral to the system and must not be removed.
