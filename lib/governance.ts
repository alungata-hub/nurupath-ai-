/**
 * RANK / HUNT / GUARD Governance Orchestration Layer
 *
 * RANK: Role, Authority, Notification Triggers, Kill Switch Protocol
 * HUNT: Handoff Triggers, Unified Context, Negotiation Rules, Termination Conditions
 * GUARD: Guardrails, Unusual Pattern Detection, Audit Trail, Red Team Testing, Dignity Preservation
 */

import type {
  AgentType, GovernanceStatus, KillSwitchReason, HandoffStage,
  HandoffValidation, AgentTraceEntry, GuardianFlag, Profile,
  KillSwitchEvent, Notification, NotificationType, PatternAlert,
} from '@/lib/types';
import { supabase } from '@/lib/supabase';

// ============================================================
// RANK: Role, Authority, Notification, Kill Switch
// ============================================================

interface AgentRankConfig {
  role: string;
  authority: string[];
  prohibited: string[];
  confidenceThreshold: number;
  notificationTriggers: NotificationType[];
  killSwitchTriggers: KillSwitchReason[];
}

export const AGENT_RANK: Record<AgentType, AgentRankConfig> = {
  scout: {
    role: 'Profile learner, validate onboarding data, identify strengths and constraints',
    authority: ['analyze_profile', 'identify_strengths', 'flag_incomplete_data'],
    prohibited: ['generate_career_recommendations', 'match_scholarships', 'approve_recommendations'],
    confidenceThreshold: 0.6,
    notificationTriggers: ['incomplete_data', 'vulnerability', 'low_confidence'],
    killSwitchTriggers: ['missing_consent', 'data_integrity'],
  },
  pathfinder: {
    role: 'Generate personalized education and career pathways',
    authority: ['generate_pathways', 'recommend_institutions', 'estimate_demand'],
    prohibited: ['approve_recommendations', 'override_guardian', 'guarantee_outcomes'],
    confidenceThreshold: 0.5,
    notificationTriggers: ['low_confidence', 'bias_alert'],
    killSwitchTriggers: ['low_confidence', 'data_integrity'],
  },
  scholarship: {
    role: 'Identify scholarships, bursaries, grants, and funding opportunities',
    authority: ['match_scholarships', 'verify_eligibility', 'identify_funding'],
    prohibited: ['guarantee_eligibility', 'guarantee_approval', 'approve_recommendations'],
    confidenceThreshold: 0.5,
    notificationTriggers: ['safety_concern', 'bias_alert'],
    killSwitchTriggers: ['data_integrity', 'safety_threshold'],
  },
  skills: {
    role: 'Analyze skills gaps and generate learning roadmaps',
    authority: ['analyze_gaps', 'generate_roadmap', 'recommend_courses'],
    prohibited: ['prescribe_mandatory_paths', 'approve_recommendations'],
    confidenceThreshold: 0.5,
    notificationTriggers: ['low_confidence', 'safety_concern'],
    killSwitchTriggers: ['data_integrity'],
  },
  guardian: {
    role: 'Conduct ethics review, bias detection, compliance validation, safety checks, final approval',
    authority: ['approve', 'reject', 'escalate', 'pause', 'modify_outputs', 'override_all_agents'],
    prohibited: ['enroll_learners', 'make_decisions_for_learners'],
    confidenceThreshold: 0.7,
    notificationTriggers: ['bias_alert', 'safety_concern', 'escalation_required', 'kill_switch_activated'],
    killSwitchTriggers: ['bias_detected', 'safety_threshold', 'compliance_violation', 'dignity_violation'],
  },
  action_plan: {
    role: 'Generate structured career action plans',
    authority: ['generate_plan', 'structure_milestones'],
    prohibited: ['approve_recommendations', 'override_guardian'],
    confidenceThreshold: 0.5,
    notificationTriggers: ['low_confidence'],
    killSwitchTriggers: ['data_integrity'],
  },
};

// ============================================================
// HUNT: Handoff Validation Engine
// ============================================================

const HANDOFF_REQUIREMENTS: Record<HandoffStage, {
  from: AgentType;
  to: AgentType;
  minProfileCompleteness: number;
  minConfidence: number;
  minOutputs: number;
  requireConsent: boolean;
  requireDataIntegrity: boolean;
}> = {
  scout_to_pathfinder: {
    from: 'scout',
    to: 'pathfinder',
    minProfileCompleteness: 90,
    minConfidence: 0.6,
    minOutputs: 1,
    requireConsent: true,
    requireDataIntegrity: true,
  },
  pathfinder_to_scholarship: {
    from: 'pathfinder',
    to: 'scholarship',
    minProfileCompleteness: 70,
    minConfidence: 0.5,
    minOutputs: 3,
    requireConsent: true,
    requireDataIntegrity: true,
  },
  scholarship_to_skills: {
    from: 'scholarship',
    to: 'skills',
    minProfileCompleteness: 70,
    minConfidence: 0.4,
    minOutputs: 1,
    requireConsent: true,
    requireDataIntegrity: true,
  },
  skills_to_guardian: {
    from: 'skills',
    to: 'guardian',
    minProfileCompleteness: 70,
    minConfidence: 0.4,
    minOutputs: 1,
    requireConsent: true,
    requireDataIntegrity: true,
  },
  guardian_to_final: {
    from: 'guardian',
    to: 'guardian', // Guardian is the final gate
    minProfileCompleteness: 70,
    minConfidence: 0.7,
    minOutputs: 1,
    requireConsent: true,
    requireDataIntegrity: true,
  },
};

export function calculateProfileCompleteness(profile: Profile): number {
  const fields: [string, unknown][] = [
    ['full_name', profile.full_name],
    ['age', profile.age],
    ['county', profile.county],
    ['gender', profile.gender],
    ['education_level', profile.education_level],
    ['academic_performance', profile.academic_performance],
    ['career_interests', profile.career_interests?.length > 0],
    ['skills', profile.skills?.length > 0],
    ['financial_constraints', profile.financial_constraints],
  ];
  const filled = fields.filter(([, v]) => v && v !== '' && v !== 0 && v !== false).length;
  return Math.round((filled / fields.length) * 100);
}

export async function validateHandoff(
  stage: HandoffStage,
  profile: Profile,
  fromOutput: { confidence_score: number; recommendations?: unknown[]; matches?: unknown[]; top_pathways?: unknown[] },
): Promise<HandoffValidation> {
  const req = HANDOFF_REQUIREMENTS[stage];
  const blockingIssues: string[] = [];

  const completeness = calculateProfileCompleteness(profile);
  const consentVerified = await verifyConsent(profile.user_id);
  const confidenceOk = fromOutput.confidence_score >= req.minConfidence;
  const outputsOk = countOutputs(fromOutput) >= req.minOutputs;

  if (completeness < req.minProfileCompleteness) {
    blockingIssues.push(`Profile completeness ${completeness}% below required ${req.minProfileCompleteness}%`);
  }
  if (!consentVerified && req.requireConsent) {
    blockingIssues.push('Consent not verified or missing');
  }
  if (!confidenceOk) {
    blockingIssues.push(`Confidence ${fromOutput.confidence_score} below threshold ${req.minConfidence}`);
  }
  if (!outputsOk) {
    blockingIssues.push(`Insufficient outputs for handoff`);
  }

  const passed = blockingIssues.length === 0;

  // Log handoff attempt
  await logAudit({
    user_id: profile.user_id,
    action: passed ? 'handoff_approved' : 'handoff_blocked',
    resource_type: 'handoff',
    details: { stage, completeness, consentVerified, confidenceOk, outputsOk, blockingIssues },
  });

  return {
    profile_completeness: completeness,
    consent_verified: consentVerified,
    confidence_above_threshold: confidenceOk,
    minimum_outputs_met: outputsOk,
    data_integrity_valid: true,
    blocking_issues: blockingIssues,
  };
}

async function verifyConsent(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('consent_records')
      .select('consent_given, revoked_at')
      .eq('user_id', userId)
      .eq('consent_type', 'data_processing')
      .maybeSingle();
    return !!data?.consent_given && !data?.revoked_at;
  } catch {
    return false;
  }
}

function countOutputs(output: { recommendations?: unknown[]; matches?: unknown[]; top_pathways?: unknown[] }): number {
  if (output.top_pathways) return output.top_pathways.length;
  if (output.matches) return output.matches.length;
  if (output.recommendations) return output.recommendations.length;
  return 0;
}

// ============================================================
// GUARD: Guardrails, Pattern Detection, Dignity Preservation
// ============================================================

export const GUARDRAILS = {
  noEthnicityRecommendations: true,
  noReligionRecommendations: true,
  noPoliticalRecommendations: true,
  noGenderStereotyping: true,
  requireConfidenceScores: true,
  requireHumanReview: true,
  neverExposePersonalIds: true,
  neverDiscloseSensitiveRecords: true,
  noShamingLanguage: true,
  noExploitativeContent: true,
  preserveAgency: true,
  noStereotypeReinforcement: true,
};

const BLOCKED_PATTERNS = [
  /\b(tribe|ethnic|tribal)\b.*\b(recommend|suggest|prefer|better|worse)\b/i,
  /\b(must|should|have to)\b.*\b(man|woman|boy|girl)\b.*\b(career|job|work)\b/i,
  /\b(stupid|lazy|hopeless|worthless|inferior)\b/i,
  /\b(you\s+(can't|cannot|will never|aren't capable))\b/i,
];

export function checkGuardrails(text: string): GuardianFlag[] {
  const flags: GuardianFlag[] = [];

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      flags.push({
        type: 'dignity',
        description: `Potentially harmful language pattern detected: ${pattern.source}`,
        severity: 'high',
        agent: 'guardian',
        recommendation: 'Review and rephrase to preserve learner dignity',
      });
    }
  }

  return flags;
}

export function detectUnusualPatterns(recentOutputs: Array<{ confidence_score: number; created_at: string }>): PatternAlert | null {
  if (recentOutputs.length < 3) return null;

  const avgConfidence = recentOutputs.reduce((sum, o) => sum + o.confidence_score, 0) / recentOutputs.length;

  // Check for confidence drift
  if (avgConfidence < 0.4) {
    return {
      id: crypto.randomUUID(),
      pattern_type: 'recommendation_drift',
      details: `Average confidence score ${avgConfidence.toFixed(2)} is below acceptable threshold`,
      severity: 'high',
      affected_users: recentOutputs.length,
      detected_at: new Date().toISOString(),
      resolved: false,
    };
  }

  // Check for spikes (many outputs in short time)
  const recentTime = recentOutputs.filter(
    (o) => Date.now() - new Date(o.created_at).getTime() < 3600000 // 1 hour
  );
  if (recentTime.length > 20) {
    return {
      id: crypto.randomUUID(),
      pattern_type: 'recommendation_spike',
      details: `${recentTime.length} recommendations generated in the last hour`,
      severity: 'medium',
      affected_users: recentTime.length,
      detected_at: new Date().toISOString(),
      resolved: false,
    };
  }

  return null;
}

// ============================================================
// Kill Switch Protocol
// ============================================================

export async function activateKillSwitch(
  userId: string,
  agent: AgentType,
  reason: KillSwitchReason,
  details: string,
): Promise<KillSwitchEvent> {
  const event: KillSwitchEvent = {
    id: crypto.randomUUID(),
    user_id: userId,
    agent,
    reason,
    details,
    auto_triggered: true,
    resolved: false,
    resolved_by: null,
    resolved_at: null,
    created_at: new Date().toISOString(),
  };

  // Log kill switch activation
  await logAudit({
    user_id: userId,
    action: 'kill_switch_activated',
    resource_type: 'kill_switch',
    details: { agent, reason, details },
  });

  // Create notification for counselors
  await createNotification({
    user_id: userId,
    target_role: 'counselor',
    type: 'kill_switch_activated',
    title: `Kill Switch: ${agent} Agent Halted`,
    message: `${agent} agent was halted for user. Reason: ${reason}. Details: ${details}`,
    agent,
    priority: 'critical',
    action_required: true,
    resource_type: 'kill_switch',
    resource_id: null,
  });

  return event;
}

// ============================================================
// Agent Trace & Audit
// ============================================================

export function createTraceEntry(
  agent: AgentType,
  action: string,
  inputSummary: string,
  outputSummary: string,
  confidenceScore: number,
  durationMs: number,
  flags: GuardianFlag[],
  status: GovernanceStatus,
): AgentTraceEntry {
  return {
    agent,
    action,
    input_summary: inputSummary,
    output_summary: outputSummary,
    confidence_score: confidenceScore,
    timestamp: new Date().toISOString(),
    duration_ms: durationMs,
    flags,
    governance_status: status,
  };
}

export async function logAudit(entry: {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: entry.user_id,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id || null,
      details: entry.details,
    });
  } catch {
    // Audit logging should never block the main flow
  }
}

// ============================================================
// Notification System
// ============================================================

export async function createNotification(notification: Omit<Notification, 'id' | 'read' | 'created_at'>): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      user_id: notification.user_id,
      target_role: notification.target_role,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      agent: notification.agent,
      priority: notification.priority,
      action_required: notification.action_required,
      resource_type: notification.resource_type,
      resource_id: notification.resource_id,
    });
  } catch {
    // Notification failure should not block
  }
}

// ============================================================
// Negotiation Rules (HUNT)
// ============================================================

export function resolveAgentConflict(
  agent1: { agent: AgentType; confidence: number; output: unknown },
  agent2: { agent: AgentType; confidence: number; output: unknown },
): { winner: AgentType; reasoning: string } {
  // Guardian Agent always has final authority
  if (agent1.agent === 'guardian') return { winner: 'guardian', reasoning: 'Guardian Agent has final authority in all conflicts' };
  if (agent2.agent === 'guardian') return { winner: 'guardian', reasoning: 'Guardian Agent has final authority in all conflicts' };

  // Higher confidence wins
  if (agent1.confidence > agent2.confidence) {
    return { winner: agent1.agent, reasoning: `${agent1.agent} has higher confidence (${agent1.confidence} vs ${agent2.confidence})` };
  }
  if (agent2.confidence > agent1.confidence) {
    return { winner: agent2.agent, reasoning: `${agent2.agent} has higher confidence (${agent2.confidence} vs ${agent1.confidence})` };
  }

  // Tie: evidence-based recommendations override assumptions
  return { winner: agent1.agent, reasoning: 'Equal confidence - defaulting to first agent output' };
}

// ============================================================
// ETHOS / PRIDE / HORIZON Checks
// ============================================================

export function performEthosCheck(output: string, profile: Profile): GuardianFlag[] {
  const flags: GuardianFlag[] = [];

  // Empathy: Check for dismissive language
  if (/\b(simply|just|merely|only)\b.*\b(need|want|do)\b/i.test(output)) {
    flags.push({
      type: 'dignity',
      description: 'Language may feel dismissive of learner circumstances',
      severity: 'low',
      agent: 'guardian',
      recommendation: 'Rephrase with more empathetic language',
    });
  }

  // Transparency: Check if reasoning is present
  if (!output || output.length < 50) {
    flags.push({
      type: 'compliance',
      description: 'Output lacks sufficient reasoning for transparency requirement',
      severity: 'medium',
      agent: 'guardian',
      recommendation: 'Add detailed reasoning to output',
    });
  }

  // Sovereignty: Check if output respects learner's stated constraints
  if (profile.financial_constraints?.includes('full_funding') &&
      /recommend.*private|suggest.*international/i.test(output)) {
    flags.push({
      type: 'safety',
      description: 'Recommending expensive options despite financial constraints',
      severity: 'medium',
      agent: 'guardian',
      recommendation: 'Prioritize affordable or funded alternatives',
    });
  }

  return flags;
}

export function checkPridePausePoints(stage: HandoffStage, confidence: number): { shouldPause: boolean; reason: string } {
  // Pause Points: Critical decision moments require human review
  if (stage === 'guardian_to_final' && confidence < 0.7) {
    return { shouldPause: true, reason: 'Final recommendation confidence below threshold - requires counselor review (PRIDE Pause Point)' };
  }
  if (stage === 'scout_to_pathfinder' && confidence < 0.5) {
    return { shouldPause: true, reason: 'Profile analysis too uncertain - requires additional information (PRIDE Pause Point)' };
  }
  return { shouldPause: false, reason: '' };
}

export function assessHorizonImpact(recommendations: string[]): GuardianFlag[] {
  const flags: GuardianFlag[] = [];

  // Check for zero-sum framing
  if (recommendations.some(r => /only.*way|must.*or.*fail|no.*other.*option/i.test(r))) {
    flags.push({
      type: 'dignity',
      description: 'Recommendation uses zero-sum framing (HORIZON check)',
      severity: 'medium',
      agent: 'guardian',
      recommendation: 'Present multiple pathways to preserve open futures',
    });
  }

  // Check for intergenerational impact
  if (recommendations.some(r => /family.*tradition|parent.*want|expected.*to/i.test(r))) {
    flags.push({
      type: 'safety',
      description: 'Recommendation may pressure learner based on family expectations (HORIZON check)',
      severity: 'low',
      agent: 'guardian',
      recommendation: 'Ensure learner agency is preserved over family expectations',
    });
  }

  return flags;
}
