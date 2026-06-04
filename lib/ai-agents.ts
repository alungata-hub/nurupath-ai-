/**
 * NuruPath AI - Multi-Agent System with RANK/HUNT/GUARD Governance
 *
 * Agent Orchestration follows HUNT protocol:
 *   Scout -> Pathfinder -> Scholarship -> Skills -> Guardian -> Final
 *
 * Each agent operates under RANK:
 *   Role, Authority, Notification Triggers, Kill Switch Protocol
 *
 * All outputs pass through GUARD:
 *   Guardrails, Unusual Pattern Detection, Audit Trail, Dignity Preservation
 */

import type {
  Profile, CareerPath, Scholarship, SkillGap, RoadmapItem, Course,
  GuardianFlag, AgentTraceEntry, GovernanceStatus, HandoffStage,
  KillSwitchReason,
} from '@/lib/types';
import {
  AGENT_RANK, validateHandoff, activateKillSwitch,
  createTraceEntry, logAudit, createNotification,
  checkGuardrails, performEthosCheck, checkPridePausePoints,
  assessHorizonImpact, GUARDRAILS,
} from '@/lib/governance';

interface AIAgentResponse {
  confidence_score: number;
  reasoning: string;
  recommendations: unknown[];
  risks: string[];
  next_steps: string[];
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const startTime = Date.now();
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ============================================================
// AGENT 1: Scout Agent
// ============================================================

export async function scoutAgent(
  profile: Profile,
  apiKey: string
): Promise<AIAgentResponse & { profile_completeness: number }> {
  const rank = AGENT_RANK.scout;
  const startTime = Date.now();

  // Kill Switch: Check consent
  const { data: consentData } = await fetchConsent(profile.user_id);
  if (!consentData) {
    await activateKillSwitch(profile.user_id, 'scout', 'missing_consent', 'No data processing consent found');
    throw new Error('Processing halted: Missing consent. Kill switch activated.');
  }

  const systemPrompt = `You are the Scout Agent for NuruPath AI, a career navigation platform for Kenyan youth.

ROLE: ${rank.role}
AUTHORITY: ${rank.authority.join(', ')}
PROHIBITED: ${rank.prohibited.join(', ')}

Your role is to analyze a student's profile and create a structured learner profile.
You must return a JSON object with these fields:
- confidence_score (0-1): How confident you are in the profile analysis
- reasoning: Why you assessed the profile this way
- recommendations: Array of key profile insights (strengths, interests, constraints)
- risks: Array of potential risk factors in the learner's situation
- next_steps: Array of recommended next actions
- profile_completeness (0-100): Percentage of profile fields meaningfully filled

CRITICAL RULES (GUARD):
- Never make recommendations based on ethnicity, religion, or political affiliation
- Never stereotype based on gender
- Always preserve learner dignity and agency
- Recognize informal skills and community knowledge as valid
- Be culturally sensitive to Kenyan contexts

Context: Kenya's education system includes KCSE, TVET certificates/diplomas, university degrees.
Constraints include financial limitations, geographic isolation, and limited information access.`;

  const userPrompt = `Analyze this Kenyan learner profile:
Name: ${profile.full_name}
Age: ${profile.age || 'Not provided'}
County: ${profile.county}
Gender: ${profile.gender}
Education Level: ${profile.education_level}
Academic Performance: ${profile.academic_performance}
Career Interests: ${profile.career_interests?.join(', ') || 'Not specified'}
Current Skills: ${profile.skills?.join(', ') || 'Not specified'}
Financial Constraints: ${profile.financial_constraints || 'Not specified'}
Language: ${profile.language_preference}

Create a structured learner profile analysis.`;

  const result = JSON.parse(await callOpenAI(systemPrompt, userPrompt, apiKey));
  const duration = Date.now() - startTime;

  // RANK: Check notification triggers
  if (result.confidence_score < rank.confidenceThreshold) {
    await createNotification({
      user_id: profile.user_id,
      target_role: 'counselor',
      type: 'low_confidence',
      title: 'Low Confidence Profile Analysis',
      message: `Scout Agent confidence ${result.confidence_score} below threshold ${rank.confidenceThreshold}`,
      agent: 'scout',
      priority: 'warning',
      action_required: true,
      resource_type: 'profile',
      resource_id: null,
    });
  }

  // Store agent trace
  await storeTrace(createTraceEntry(
    'scout', 'profile_analysis', profile.full_name,
    `Confidence: ${result.confidence_score}`, result.confidence_score,
    duration, [], result.confidence_score >= rank.confidenceThreshold ? 'approved' : 'paused'
  ), profile.user_id);

  return result;
}

// ============================================================
// AGENT 2: Pathfinder Agent
// ============================================================

export async function pathfinderAgent(
  profile: Profile,
  assessmentResponses: Record<string, string | string[]>,
  apiKey: string
): Promise<{
  confidence_score: number;
  reasoning: string;
  top_pathways: CareerPath[];
  required_education: { level: string; field: string; institution_type: string; duration: string }[];
  required_skills: string[];
  estimated_demand: Record<string, string>;
  recommended_institutions: { name: string; location: string; type: string; program: string; url: string }[];
  recommended_certifications: { name: string; provider: string; duration: string; relevance: string }[];
  risks: string[];
  next_steps: string[];
}> {
  const rank = AGENT_RANK.pathfinder;
  const startTime = Date.now();

  // HUNT: Validate handoff from Scout
  const handoff = await validateHandoff('scout_to_pathfinder', profile, { confidence_score: 0.7 });
  if (handoff.blocking_issues.length > 0) {
    await activateKillSwitch(profile.user_id, 'pathfinder', 'data_integrity',
      `Handoff validation failed: ${handoff.blocking_issues.join('; ')}`);
    throw new Error(`Pathfinder blocked: ${handoff.blocking_issues.join('; ')}`);
  }

  const systemPrompt = `You are the Pathfinder Agent for NuruPath AI.

ROLE: ${rank.role}
AUTHORITY: ${rank.authority.join(', ')}
PROHIBITED: ${rank.prohibited.join(', ')}

Generate personalized career pathway recommendations for Kenyan youth.
Return a JSON object with:
- confidence_score (0-1)
- reasoning
- top_pathways: Array of top 3 career paths, each with: title, description, match_score (0-100), sector, demand_level, avg_salary (in KES), required_education, growth_outlook
- required_education: Array of education requirements
- required_skills: Array of skill names needed
- estimated_demand: Object mapping sector to demand level
- recommended_institutions: Array of real Kenyan institutions
- recommended_certifications: Array of certifications
- risks: Array of career risks
- next_steps: Array of recommended actions

CRITICAL RULES (GUARD / GUARDRAILS):
- ${GUARDRAILS.noEthnicityRecommendations ? 'NEVER base recommendations on ethnicity' : ''}
- ${GUARDRAILS.noGenderStereotyping ? 'NEVER stereotype careers by gender' : ''}
- ${GUARDRAILS.noShamingLanguage ? 'NEVER use shaming or discouraging language' : ''}
- ${GUARDRAILS.preserveAgency ? 'Always preserve learner agency - present options, never dictate' : ''}
- Include both traditional and emerging sectors
- Reference Kenya Vision 2030 and Big 4 Agenda
- Use realistic Kenyan salary ranges
- Reference real institutions and programs`;

  const userPrompt = `Based on this profile and assessment:
Profile: ${JSON.stringify({ name: profile.full_name, age: profile.age, county: profile.county, education: profile.education_level, performance: profile.academic_performance, interests: profile.career_interests, skills: profile.skills, financial: profile.financial_constraints })}
Assessment Responses: ${JSON.stringify(assessmentResponses)}

Generate personalized career pathway recommendations.`;

  const result = JSON.parse(await callOpenAI(systemPrompt, userPrompt, apiKey));
  const duration = Date.now() - startTime;

  // GUARD: Check guardrails on output text
  const outputText = JSON.stringify(result);
  const guardrailFlags = checkGuardrails(outputText);
  const ethosFlags = performEthosCheck(outputText, profile);
  const horizonFlags = assessHorizonImpact(result.top_pathways?.map((p: CareerPath) => p.description) || []);
  const allFlags = [...guardrailFlags, ...ethosFlags, ...horizonFlags];

  if (allFlags.some(f => f.severity === 'high' || f.severity === 'critical')) {
    await activateKillSwitch(profile.user_id, 'pathfinder', 'dignity_violation',
      `Guardrail violation detected: ${allFlags.map(f => f.description).join('; ')}`);
  }

  // Store trace
  await storeTrace(createTraceEntry(
    'pathfinder', 'generate_pathways', 'Profile + Assessment',
    `${result.top_pathways?.length || 0} pathways generated`, result.confidence_score,
    duration, allFlags, allFlags.length === 0 ? 'approved' : 'flagged'
  ), profile.user_id);

  return { ...result, _flags: allFlags };
}

// ============================================================
// AGENT 3: Scholarship Agent
// ============================================================

export async function scholarshipAgent(
  profile: Profile,
  apiKey: string
): Promise<{
  confidence_score: number;
  reasoning: string;
  matches: Scholarship[];
  risks: string[];
  next_steps: string[];
}> {
  const rank = AGENT_RANK.scholarship;
  const startTime = Date.now();

  const systemPrompt = `You are the Scholarship Agent for NuruPath AI.

ROLE: ${rank.role}
AUTHORITY: ${rank.authority.join(', ')}
PROHIBITED: ${rank.prohibited.join(', ')}

Identify funding opportunities for Kenyan students and youth.
Return a JSON object with:
- confidence_score (0-1)
- reasoning
- matches: Array of scholarship matches with: name, provider, description, match_score (0-100), amount, deadline, url, eligibility_met, eligibility_missing
- risks: Array of risks
- next_steps: Array of actions to apply

CRITICAL RULES:
- NEVER guarantee eligibility, approval, or funding outcomes
- Only recommend scholarships you are confident exist
- If uncertain about a scholarship's existence, exclude it
- Consider education level, county (especially ASAL counties), gender, and financial need
- Include real programs: HELB, Equity Wings to Fly, KCB Foundation, County Bursaries, DAAD, Aga Khan, M-Pesa Foundation, USAID`;

  const userPrompt = `Find scholarship matches for:
Education Level: ${profile.education_level}
County: ${profile.county}
Gender: ${profile.gender}
Financial Need: ${profile.financial_constraints}
Age: ${profile.age}
Interests: ${profile.career_interests?.join(', ')}`;

  const result = JSON.parse(await callOpenAI(systemPrompt, userPrompt, apiKey));
  const duration = Date.now() - startTime;

  await storeTrace(createTraceEntry(
    'scholarship', 'match_scholarships', 'Profile data',
    `${result.matches?.length || 0} matches found`, result.confidence_score,
    duration, [], result.confidence_score >= rank.confidenceThreshold ? 'approved' : 'flagged'
  ), profile.user_id);

  return result;
}

// ============================================================
// AGENT 4: Skills Agent
// ============================================================

export async function skillsAgent(
  profile: Profile,
  targetCareer: string,
  apiKey: string
): Promise<{
  confidence_score: number;
  reasoning: string;
  current_skills: string[];
  required_skills: string[];
  gap_score: number;
  gap_analysis: SkillGap[];
  learning_roadmap: RoadmapItem[];
  recommended_courses: Course[];
  risks: string[];
  next_steps: string[];
}> {
  const rank = AGENT_RANK.skills;
  const startTime = Date.now();

  const systemPrompt = `You are the Skills Agent for NuruPath AI.

ROLE: ${rank.role}
AUTHORITY: ${rank.authority.join(', ')}
PROHIBITED: ${rank.prohibited.join(', ')}

Analyze skills gaps and create learning roadmaps.
Return a JSON object with:
- confidence_score (0-1)
- reasoning
- current_skills, required_skills, gap_score (0-100), gap_analysis, learning_roadmap, recommended_courses
- risks, next_steps

CRITICAL RULES:
- NEVER prescribe mandatory educational pathways
- Present roadmaps as options, not requirements
- Include free/affordable resources accessible to Kenyan youth
- Prioritize: Coursera, edX, Google Skills, Kenya Digital Literacy Programme, local TVET short courses`;

  const userPrompt = `Analyze skills gap for:
Current Skills: ${profile.skills?.join(', ') || 'None specified'}
Education: ${profile.education_level}
Target Career: ${targetCareer}
County: ${profile.county}
Financial Constraints: ${profile.financial_constraints}`;

  const result = JSON.parse(await callOpenAI(systemPrompt, userPrompt, apiKey));
  const duration = Date.now() - startTime;

  await storeTrace(createTraceEntry(
    'skills', 'skills_gap_analysis', `Target: ${targetCareer}`,
    `Gap score: ${result.gap_score}%`, result.confidence_score,
    duration, [], result.confidence_score >= rank.confidenceThreshold ? 'approved' : 'flagged'
  ), profile.user_id);

  return result;
}

// ============================================================
// AGENT 5: Guardian Agent (Enhanced)
// ============================================================

export async function guardianAgent(
  outputType: 'career' | 'scholarship' | 'skills' | 'action_plan',
  output: unknown,
  profile: Profile,
  apiKey: string
): Promise<{
  approved: boolean;
  flags: GuardianFlag[];
  reasoning: string;
  modified_output?: unknown;
}> {
  const rank = AGENT_RANK.guardian;
  const startTime = Date.now();

  const systemPrompt = `You are the Guardian Agent for NuruPath AI.
You are the FINAL gate before recommendations reach users. Only you can approve recommendations.

ROLE: ${rank.role}
AUTHORITY: ${rank.authority.join(', ')}

Review the output for ALL of the following:

1. SAFETY: Could this cause harm? Dangerous career paths? Unrealistic expectations?
2. BIAS: Gender, ethnic, regional, or socioeconomic bias?
3. HALLUCINATION: Are institutions, scholarships, salary figures, and programs real?
4. ACCURACY: Is the advice appropriate for the learner's education level and context?
5. DIGNITY: Does the output humiliate, shame, stereotype, or remove agency?
6. COMPLIANCE: Does it meet Kenya Data Protection Act and platform consent requirements?

GUARDRAILS ENFORCEMENT:
- No recommendations based on ethnicity, religion, or political affiliation
- No gender stereotyping in career suggestions
- Confidence scores must be present
- Never expose personal identifiers
- Never disclose sensitive records
- Never use shaming language
- Always preserve learner agency

ETHOS CHECK:
- Empathy: Is the tone supportive and respectful?
- Transparency: Is reasoning clear?
- Human Impact: Could this output affect the learner's life decisions?
- Ownership: Does the learner retain choice?
- Sovereignty: Is the learner's data and context respected?

HORIZON CHECK:
- Does this create zero-sum traps? (e.g., "this is your ONLY option")
- Does it consider intergenerational impact?
- Are open futures preserved?

Return a JSON object with:
- approved (boolean): Whether the output can be shown to the user
- flags: Array of objects with type (bias/hallucination/safety/accuracy/dignity/compliance), description, severity (low/medium/high/critical), agent (which agent produced the issue), recommendation (how to fix)
- reasoning: Detailed explanation of your review
- modified_output: If you corrected any issues, provide the corrected version

CRITICAL: If ANY flag has severity "critical", set approved to false.
If severity "high" flags exist, set approved to false UNLESS you have corrected them in modified_output.`;

  const userPrompt = `Review this ${outputType} output for a ${profile.gender || 'person'} from ${profile.county} County, education level: ${profile.education_level}, financial constraints: ${profile.financial_constraints || 'Not specified'}:

${JSON.stringify(output, null, 2)}

Perform comprehensive GUARD review. Ensure safety, dignity, and compliance.`;

  const result = JSON.parse(await callOpenAI(systemPrompt, userPrompt, apiKey));
  const duration = Date.now() - startTime;

  // If not approved, notify counselors
  if (!result.approved) {
    await createNotification({
      user_id: profile.user_id,
      target_role: 'counselor',
      type: 'escalation_required',
      title: `Guardian Agent: ${outputType} output requires review`,
      message: `Guardian rejected output with ${result.flags?.length || 0} flags. Human review required.`,
      agent: 'guardian',
      priority: 'critical',
      action_required: true,
      resource_type: outputType,
      resource_id: null,
    });
  }

  // Store trace
  await storeTrace(createTraceEntry(
    'guardian', `review_${outputType}`, `${outputType} output`,
    result.approved ? 'Approved' : `Rejected: ${result.flags?.length || 0} flags`,
    result.approved ? 1.0 : 0.0,
    duration, result.flags || [],
    result.approved ? 'approved' : 'rejected'
  ), profile.user_id);

  return result;
}

// ============================================================
// Action Plan Agent
// ============================================================

export async function actionPlanAgent(
  profile: Profile,
  careerPath: string,
  apiKey: string
): Promise<{
  confidence_score: number;
  reasoning: string;
  plan_30_days: { title: string; goals: string[]; actions: { week: string; task: string; resource: string; metric: string }[]; milestones: string[] };
  plan_90_days: { title: string; goals: string[]; actions: { week: string; task: string; resource: string; metric: string }[]; milestones: string[] };
  plan_1_year: { title: string; goals: string[]; actions: { week: string; task: string; resource: string; metric: string }[]; milestones: string[] };
  risks: string[];
  next_steps: string[];
}> {
  const rank = AGENT_RANK.action_plan;
  const startTime = Date.now();

  const systemPrompt = `You are the Action Plan Agent for NuruPath AI.

ROLE: ${rank.role}
AUTHORITY: ${rank.authority.join(', ')}

Generate a structured career action plan for a Kenyan youth.
Return a JSON object with:
- confidence_score (0-1), reasoning
- plan_30_days, plan_90_days, plan_1_year (each with title, goals[], actions[{week,task,resource,metric}], milestones[])
- risks[], next_steps[]

CRITICAL RULES:
- Plans must be realistic and actionable for the learner's context
- Consider internet access limitations in some Kenyan counties
- Include offline/low-bandwidth alternatives where possible
- Present as guidance, not mandates
- Include both free and paid resources with clear cost indicators`;

  const userPrompt = `Generate a career action plan for:
Name: ${profile.full_name}
Age: ${profile.age || 'Not specified'}
County: ${profile.county}
Education: ${profile.education_level}
Skills: ${profile.skills?.join(', ') || 'None specified'}
Financial: ${profile.financial_constraints}
Target Career: ${careerPath}`;

  const result = JSON.parse(await callOpenAI(systemPrompt, userPrompt, apiKey));
  const duration = Date.now() - startTime;

  await storeTrace(createTraceEntry(
    'action_plan', 'generate_plan', `Target: ${careerPath}`,
    'Plan generated', result.confidence_score,
    duration, [], result.confidence_score >= rank.confidenceThreshold ? 'approved' : 'flagged'
  ), profile.user_id);

  return result;
}

// ============================================================
// Helpers
// ============================================================

async function fetchConsent(userId: string): Promise<{ data: boolean }> {
  try {
    const { supabase: sb } = await import('@/lib/supabase');
    const { data } = await sb
      .from('consent_records')
      .select('consent_given, revoked_at')
      .eq('user_id', userId)
      .eq('consent_type', 'data_processing')
      .maybeSingle();
    return { data: !!data?.consent_given && !data?.revoked_at };
  } catch {
    return { data: false };
  }
}

async function storeTrace(trace: AgentTraceEntry, userId: string): Promise<void> {
  try {
    const { supabase: sb } = await import('@/lib/supabase');
    await sb.from('agent_trace').insert({
      user_id: userId,
      agent: trace.agent,
      action: trace.action,
      input_summary: trace.input_summary,
      output_summary: trace.output_summary,
      confidence_score: trace.confidence_score,
      duration_ms: trace.duration_ms,
      flags: trace.flags,
      governance_status: trace.governance_status,
    });
  } catch {
    // Trace logging should never block
  }
}
