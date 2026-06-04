/*
  # NuruPath AI - Core Database Schema

  1. New Tables
    - `profiles` - User profile data (name, age, county, education level, etc.)
    - `assessments` - Career assessment responses and results
    - `career_recommendations` - AI-generated career pathway recommendations
    - `scholarship_matches` - Scholarship matching results
    - `skills_reports` - Skills gap analysis reports
    - `action_plans` - Career action plans (30/90/365 day)
    - `counselor_notes` - Counselor feedback on recommendations
    - `audit_logs` - System audit trail for accountability
    - `consent_records` - User consent tracking for data usage

  2. Security
    - Enable RLS on all tables
    - Students can only read/write their own data
    - Counselors can read assigned student data and write notes
    - Admin role has broader access
    - All policies check authentication via auth.uid()

  3. Important Notes
    - All tables use UUID primary keys with gen_random_uuid()
    - Timestamps use timestamptz with DEFAULT now()
    - RLS is restrictive by default - no access until policies added
    - Counselor-student relationship via profiles.counselor_id
*/

-- Profiles table: stores user onboarding data
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  age integer,
  county text DEFAULT '',
  sub_county text DEFAULT '',
  gender text DEFAULT '',
  education_level text DEFAULT '',
  academic_performance text DEFAULT '',
  career_interests text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  financial_constraints text DEFAULT '',
  language_preference text DEFAULT 'en',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'counselor', 'admin')),
  counselor_id uuid REFERENCES profiles(id),
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assessments table: stores assessment questions and responses
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses jsonb NOT NULL DEFAULT '{}',
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Career recommendations from AI
CREATE TABLE IF NOT EXISTS career_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES assessments(id),
  recommendations jsonb NOT NULL DEFAULT '[]',
  top_pathways jsonb NOT NULL DEFAULT '[]',
  required_education jsonb NOT NULL DEFAULT '[]',
  required_skills jsonb NOT NULL DEFAULT '[]',
  estimated_demand jsonb NOT NULL DEFAULT '{}',
  recommended_institutions jsonb NOT NULL DEFAULT '[]',
  recommended_certifications jsonb NOT NULL DEFAULT '[]',
  confidence_score numeric DEFAULT 0,
  reasoning text DEFAULT '',
  risks text[] DEFAULT '{}',
  next_steps text[] DEFAULT '{}',
  guardian_approved boolean DEFAULT false,
  guardian_flags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Scholarship matches
CREATE TABLE IF NOT EXISTS scholarship_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matches jsonb NOT NULL DEFAULT '[]',
  confidence_score numeric DEFAULT 0,
  reasoning text DEFAULT '',
  risks text[] DEFAULT '{}',
  next_steps text[] DEFAULT '{}',
  guardian_approved boolean DEFAULT false,
  guardian_flags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills gap analysis reports
CREATE TABLE IF NOT EXISTS skills_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_skills text[] NOT NULL DEFAULT '{}',
  required_skills text[] NOT NULL DEFAULT '{}',
  gap_score numeric DEFAULT 0,
  gap_analysis jsonb NOT NULL DEFAULT '[]',
  learning_roadmap jsonb NOT NULL DEFAULT '[]',
  recommended_courses jsonb NOT NULL DEFAULT '[]',
  confidence_score numeric DEFAULT 0,
  reasoning text DEFAULT '',
  risks text[] DEFAULT '{}',
  next_steps text[] DEFAULT '{}',
  guardian_approved boolean DEFAULT false,
  guardian_flags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Career action plans
CREATE TABLE IF NOT EXISTS action_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_30_days jsonb NOT NULL DEFAULT '{}',
  plan_90_days jsonb NOT NULL DEFAULT '{}',
  plan_1_year jsonb NOT NULL DEFAULT '{}',
  confidence_score numeric DEFAULT 0,
  reasoning text DEFAULT '',
  risks text[] DEFAULT '{}',
  next_steps text[] DEFAULT '{}',
  guardian_approved boolean DEFAULT false,
  guardian_flags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Counselor notes on student recommendations
CREATE TABLE IF NOT EXISTS counselor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('career', 'scholarship', 'skills', 'action_plan')),
  recommendation_id uuid NOT NULL,
  comment text NOT NULL DEFAULT '',
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit logs for TRACK compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Consent records for OASIS compliance
CREATE TABLE IF NOT EXISTS consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  consent_given boolean NOT NULL DEFAULT false,
  consent_text text DEFAULT '',
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Students can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors can read assigned students"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'counselor'
    ) AND counselor_id IN (
      SELECT p2.user_id FROM profiles p2 WHERE p2.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Assessments policies
CREATE POLICY "Students can read own assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own assessments"
  ON assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own assessments"
  ON assessments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors and admins can read student assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')
    )
  );

-- Career recommendations policies
CREATE POLICY "Students can read own recommendations"
  ON career_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own recommendations"
  ON career_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors and admins can read recommendations"
  ON career_recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')
    )
  );

CREATE POLICY "Admins can update recommendations"
  ON career_recommendations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Scholarship matches policies
CREATE POLICY "Students can read own scholarships"
  ON scholarship_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own scholarships"
  ON scholarship_matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors and admins can read scholarships"
  ON scholarship_matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')
    )
  );

-- Skills reports policies
CREATE POLICY "Students can read own skills reports"
  ON skills_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own skills reports"
  ON skills_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors and admins can read skills reports"
  ON skills_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')
    )
  );

-- Action plans policies
CREATE POLICY "Students can read own action plans"
  ON action_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own action plans"
  ON action_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors and admins can read action plans"
  ON action_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')
    )
  );

-- Counselor notes policies
CREATE POLICY "Counselors can read own notes"
  ON counselor_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = counselor_id);

CREATE POLICY "Students can read notes about them"
  ON counselor_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Counselors can insert notes"
  ON counselor_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = counselor_id);

CREATE POLICY "Counselors can update own notes"
  ON counselor_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = counselor_id)
  WITH CHECK (auth.uid() = counselor_id);

-- Audit logs policies (read-only for admins)
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Consent records policies
CREATE POLICY "Users can read own consent records"
  ON consent_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
  ON consent_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_counselor_id ON profiles(counselor_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_career_recommendations_user_id ON career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_scholarship_matches_user_id ON scholarship_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_reports_user_id ON skills_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_counselor_notes_counselor_id ON counselor_notes(counselor_id);
CREATE INDEX IF NOT EXISTS idx_counselor_notes_student_id ON counselor_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_recommendations_updated_at BEFORE UPDATE ON career_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholarship_matches_updated_at BEFORE UPDATE ON scholarship_matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_reports_updated_at BEFORE UPDATE ON skills_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON action_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_counselor_notes_updated_at BEFORE UPDATE ON counselor_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
