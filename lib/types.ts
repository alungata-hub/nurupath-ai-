export type UserRole = 'student' | 'counselor' | 'admin';

export type AgentType = 'scout' | 'pathfinder' | 'scholarship' | 'skills' | 'guardian' | 'action_plan';

export type GovernanceStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'paused' | 'killed' | 'flagged';

export type KillSwitchReason = 'missing_consent' | 'low_confidence' | 'bias_detected' | 'data_integrity' | 'safety_threshold' | 'compliance_violation' | 'human_escalation' | 'dignity_violation';

export type NotificationType = 'vulnerability' | 'incomplete_data' | 'low_confidence' | 'bias_alert' | 'safety_concern' | 'counselor_override' | 'kill_switch_activated' | 'handoff_complete' | 'recommendation_ready' | 'escalation_required';

export type HandoffStage = 'scout_to_pathfinder' | 'pathfinder_to_scholarship' | 'scholarship_to_skills' | 'skills_to_guardian' | 'guardian_to_final';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  age: number | null;
  county: string;
  sub_county: string;
  gender: string;
  education_level: string;
  academic_performance: string;
  career_interests: string[];
  skills: string[];
  financial_constraints: string;
  language_preference: string;
  phone: string;
  role: UserRole;
  counselor_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  responses: Record<string, string | string[]>;
  status: 'in_progress' | 'completed' | 'reviewed';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerRecommendation {
  id: string;
  user_id: string;
  assessment_id: string | null;
  recommendations: CareerPath[];
  top_pathways: CareerPath[];
  required_education: EducationRequirement[];
  required_skills: string[];
  estimated_demand: Record<string, string>;
  recommended_institutions: Institution[];
  recommended_certifications: Certification[];
  confidence_score: number;
  reasoning: string;
  risks: string[];
  next_steps: string[];
  guardian_approved: boolean;
  guardian_flags: GuardianFlag[];
  governance_status: GovernanceStatus;
  agent_trace: AgentTraceEntry[];
  created_at: string;
  updated_at: string;
}

export interface CareerPath {
  title: string;
  description: string;
  match_score: number;
  sector: string;
  demand_level: string;
  avg_salary: string;
  required_education: string;
  growth_outlook: string;
}

export interface EducationRequirement {
  level: string;
  field: string;
  institution_type: string;
  duration: string;
}

export interface Institution {
  name: string;
  location: string;
  type: string;
  program: string;
  url: string;
}

export interface Certification {
  name: string;
  provider: string;
  duration: string;
  relevance: string;
}

export interface GuardianFlag {
  type: 'bias' | 'hallucination' | 'safety' | 'accuracy' | 'dignity' | 'compliance';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  agent: AgentType;
  recommendation: string;
}

export interface ScholarshipMatch {
  id: string;
  user_id: string;
  matches: Scholarship[];
  confidence_score: number;
  reasoning: string;
  risks: string[];
  next_steps: string[];
  guardian_approved: boolean;
  guardian_flags: GuardianFlag[];
  governance_status: GovernanceStatus;
  agent_trace: AgentTraceEntry[];
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  name: string;
  provider: string;
  description: string;
  match_score: number;
  amount: string;
  deadline: string;
  url: string;
  eligibility_met: string[];
  eligibility_missing: string[];
}

export interface SkillsReport {
  id: string;
  user_id: string;
  current_skills: string[];
  required_skills: string[];
  gap_score: number;
  gap_analysis: SkillGap[];
  learning_roadmap: RoadmapItem[];
  recommended_courses: Course[];
  confidence_score: number;
  reasoning: string;
  risks: string[];
  next_steps: string[];
  guardian_approved: boolean;
  guardian_flags: GuardianFlag[];
  governance_status: GovernanceStatus;
  agent_trace: AgentTraceEntry[];
  created_at: string;
  updated_at: string;
}

export interface SkillGap {
  skill: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority: 'critical' | 'important' | 'nice_to_have';
}

export interface RoadmapItem {
  phase: string;
  skill: string;
  action: string;
  resource: string;
  duration: string;
}

export interface Course {
  name: string;
  provider: string;
  platform: string;
  duration: string;
  cost: string;
  url: string;
  relevance: string;
}

export interface ActionPlan {
  id: string;
  user_id: string;
  plan_30_days: PlanPhase;
  plan_90_days: PlanPhase;
  plan_1_year: PlanPhase;
  confidence_score: number;
  reasoning: string;
  risks: string[];
  next_steps: string[];
  guardian_approved: boolean;
  guardian_flags: GuardianFlag[];
  governance_status: GovernanceStatus;
  agent_trace: AgentTraceEntry[];
  created_at: string;
  updated_at: string;
}

export interface PlanPhase {
  title: string;
  goals: string[];
  actions: PlanAction[];
  milestones: string[];
}

export interface PlanAction {
  week: string;
  task: string;
  resource: string;
  metric: string;
}

export interface CounselorNote {
  id: string;
  counselor_id: string;
  student_id: string;
  recommendation_type: 'career' | 'scholarship' | 'skills' | 'action_plan';
  recommendation_id: string;
  comment: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: string;
  consent_given: boolean;
  consent_text: string;
  ip_address: string;
  created_at: string;
  revoked_at: string | null;
}

export interface AIResponse {
  confidence_score: number;
  reasoning: string;
  recommendations: unknown[];
  risks: string[];
  next_steps: string[];
}

export interface DashboardData {
  profile: Profile | null;
  latestAssessment: Assessment | null;
  careerRecommendation: CareerRecommendation | null;
  scholarshipMatch: ScholarshipMatch | null;
  skillsReport: SkillsReport | null;
  actionPlan: ActionPlan | null;
  counselorNotes: CounselorNote[];
  notifications: Notification[];
}

// RANK/HUNT/GUARD Governance Types

export interface AgentTraceEntry {
  agent: AgentType;
  action: string;
  input_summary: string;
  output_summary: string;
  confidence_score: number;
  timestamp: string;
  duration_ms: number;
  flags: GuardianFlag[];
  governance_status: GovernanceStatus;
}

export interface HandoffRecord {
  id: string;
  user_id: string;
  from_agent: AgentType;
  to_agent: AgentType;
  stage: HandoffStage;
  validation_passed: boolean;
  validation_details: HandoffValidation;
  created_at: string;
}

export interface HandoffValidation {
  profile_completeness: number;
  consent_verified: boolean;
  confidence_above_threshold: boolean;
  minimum_outputs_met: boolean;
  data_integrity_valid: boolean;
  blocking_issues: string[];
}

export interface KillSwitchEvent {
  id: string;
  user_id: string;
  agent: AgentType;
  reason: KillSwitchReason;
  details: string;
  auto_triggered: boolean;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  target_role: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  agent: AgentType;
  priority: 'info' | 'warning' | 'critical';
  read: boolean;
  action_required: boolean;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
}

export interface PatternAlert {
  id: string;
  pattern_type: 'recommendation_spike' | 'bias_pattern' | 'data_anomaly' | 'recommendation_drift' | 'fraud_indicator';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_users: number;
  detected_at: string;
  resolved: boolean;
}

export interface GovernanceReport {
  user_id: string;
  scout_result: unknown;
  pathfinder_result: unknown;
  scholarship_result: unknown;
  skills_result: unknown;
  guardian_result: unknown;
  handoff_records: HandoffRecord[];
  agent_trace: AgentTraceEntry[];
  kill_switch_events: KillSwitchEvent[];
  final_status: GovernanceStatus;
  confidence_score: number;
}
