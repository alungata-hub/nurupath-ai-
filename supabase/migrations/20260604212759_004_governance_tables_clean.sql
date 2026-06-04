/*
  # NuruPath AI - Governance Tables (clean install)

  Creates notifications, handoff_records, kill_switch_events, pattern_alerts, agent_trace
  Adds governance_status and agent_trace columns to recommendation tables
*/

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role text NOT NULL DEFAULT 'counselor',
  type text NOT NULL,
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  agent text NOT NULL DEFAULT 'scout',
  priority text NOT NULL DEFAULT 'info',
  read boolean DEFAULT false,
  action_required boolean DEFAULT false,
  resource_type text DEFAULT '',
  resource_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Handoff records
CREATE TABLE IF NOT EXISTS handoff_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_agent text NOT NULL,
  to_agent text NOT NULL,
  stage text NOT NULL,
  validation_passed boolean NOT NULL DEFAULT false,
  validation_details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Kill switch events
CREATE TABLE IF NOT EXISTS kill_switch_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent text NOT NULL,
  reason text NOT NULL,
  details text DEFAULT '',
  auto_triggered boolean DEFAULT true,
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Pattern alerts
CREATE TABLE IF NOT EXISTS pattern_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type text NOT NULL,
  details text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  affected_users integer DEFAULT 0,
  detected_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz
);

-- Agent trace
CREATE TABLE IF NOT EXISTS agent_trace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent text NOT NULL,
  action text NOT NULL,
  input_summary text DEFAULT '',
  output_summary text DEFAULT '',
  confidence_score numeric DEFAULT 0,
  duration_ms integer DEFAULT 0,
  flags jsonb DEFAULT '[]',
  governance_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE handoff_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE kill_switch_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_trace ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff read all notifications"
  ON notifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')));

CREATE POLICY "System insert notifications"
  ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Handoff records policies
CREATE POLICY "Staff read handoffs"
  ON handoff_records FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')));

CREATE POLICY "System insert handoffs"
  ON handoff_records FOR INSERT TO authenticated WITH CHECK (true);

-- Kill switch policies
CREATE POLICY "Staff read kill switches"
  ON kill_switch_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')));

CREATE POLICY "System insert kill switches"
  ON kill_switch_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff update kill switches"
  ON kill_switch_events FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')));

-- Pattern alerts policies
CREATE POLICY "Admins read patterns"
  ON pattern_alerts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "System insert patterns"
  ON pattern_alerts FOR INSERT TO authenticated WITH CHECK (true);

-- Agent trace policies
CREATE POLICY "Admins read agent trace"
  ON agent_trace FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "System insert agent trace"
  ON agent_trace FOR INSERT TO authenticated WITH CHECK (true);

-- Add governance columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'career_recommendations' AND column_name = 'governance_status') THEN
    ALTER TABLE career_recommendations ADD COLUMN governance_status text DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'career_recommendations' AND column_name = 'agent_trace') THEN
    ALTER TABLE career_recommendations ADD COLUMN agent_trace jsonb DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scholarship_matches' AND column_name = 'governance_status') THEN
    ALTER TABLE scholarship_matches ADD COLUMN governance_status text DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scholarship_matches' AND column_name = 'agent_trace') THEN
    ALTER TABLE scholarship_matches ADD COLUMN agent_trace jsonb DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills_reports' AND column_name = 'governance_status') THEN
    ALTER TABLE skills_reports ADD COLUMN governance_status text DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills_reports' AND column_name = 'agent_trace') THEN
    ALTER TABLE skills_reports ADD COLUMN agent_trace jsonb DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'action_plans' AND column_name = 'governance_status') THEN
    ALTER TABLE action_plans ADD COLUMN governance_status text DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'action_plans' AND column_name = 'agent_trace') THEN
    ALTER TABLE action_plans ADD COLUMN agent_trace jsonb DEFAULT '[]';
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_agent_trace_user_agent ON agent_trace(user_id, agent);
CREATE INDEX IF NOT EXISTS idx_kill_switch_unresolved ON kill_switch_events(resolved) WHERE resolved = false;
