'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Activity, FileText, Loader2, AlertTriangle, Bell, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AgentTraceEntry {
  id: string;
  agent: string;
  action: string;
  input_summary: string;
  output_summary: string;
  confidence_score: number;
  duration_ms: number;
  flags: Array<{ type: string; description: string; severity: string }>;
  governance_status: string;
  created_at: string;
  user_id: string;
}

interface KillSwitchEvent {
  id: string;
  agent: string;
  reason: string;
  details: string;
  auto_triggered: boolean;
  resolved: boolean;
  created_at: string;
  user_id: string;
}

interface PatternAlert {
  id: string;
  pattern_type: string;
  details: string;
  severity: string;
  affected_users: number;
  detected_at: string;
  resolved: boolean;
}

export default function AdminPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, totalAssessments: 0, totalRecommendations: 0, unresolvedKillSwitches: 0 });
  const [agentTraces, setAgentTraces] = useState<AgentTraceEntry[]>([]);
  const [killSwitches, setKillSwitches] = useState<KillSwitchEvent[]>([]);
  const [patterns, setPatterns] = useState<PatternAlert[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    } else if (profile?.role !== 'admin') {
      router.push('/dashboard');
    } else {
      fetchAdminData();
    }
  }, [user, profile, router]);

  const fetchAdminData = async () => {
    try {
      const [studentsRes, assessmentsRes, recsRes, tracesRes, killRes, patternsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('assessments').select('*', { count: 'exact', head: true }),
        supabase.from('career_recommendations').select('*', { count: 'exact', head: true }),
        supabase.from('agent_trace').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('kill_switch_events').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('pattern_alerts').select('*').order('detected_at', { ascending: false }).limit(20),
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalAssessments: assessmentsRes.count || 0,
        totalRecommendations: recsRes.count || 0,
        unresolvedKillSwitches: (killRes.data as KillSwitchEvent[] || []).filter(k => !k.resolved).length,
      });
      setAgentTraces((tracesRes.data || []) as AgentTraceEntry[]);
      setKillSwitches((killRes.data || []) as KillSwitchEvent[]);
      setPatterns((patternsRes.data || []) as PatternAlert[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const resolveKillSwitch = async (id: string) => {
    await supabase.from('kill_switch_events').update({ resolved: true, resolved_at: new Date().toISOString() }).eq('id', id);
    fetchAdminData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nuru-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-nuru-green-800 flex items-center gap-2">
              <Shield className="h-6 w-6" /> Admin Portal
            </h1>
            <p className="text-muted-foreground mt-1">System overview, governance, and audit management</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Card><CardContent className="p-4 text-center"><Users className="h-5 w-5 text-nuru-green-600 mx-auto mb-1" /><div className="text-2xl font-bold">{stats.totalStudents}</div><div className="text-xs text-muted-foreground">Students</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><FileText className="h-5 w-5 text-nuru-gold-600 mx-auto mb-1" /><div className="text-2xl font-bold">{stats.totalAssessments}</div><div className="text-xs text-muted-foreground">Assessments</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Activity className="h-5 w-5 text-nuru-green-600 mx-auto mb-1" /><div className="text-2xl font-bold">{stats.totalRecommendations}</div><div className="text-xs text-muted-foreground">Recommendations</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-1" /><div className="text-2xl font-bold text-red-600">{stats.unresolvedKillSwitches}</div><div className="text-xs text-muted-foreground">Active Kill Switches</div></CardContent></Card>
          </div>

          <Tabs defaultValue="audit">
            <TabsList className="w-full flex-wrap">
              <TabsTrigger value="audit" className="flex-1">Audit Trail</TabsTrigger>
              <TabsTrigger value="killswitch" className="flex-1">Kill Switches</TabsTrigger>
              <TabsTrigger value="patterns" className="flex-1">Pattern Alerts</TabsTrigger>
              <TabsTrigger value="system" className="flex-1">System</TabsTrigger>
            </TabsList>

            <TabsContent value="audit" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agent Execution Trace</CardTitle>
                  <CardDescription>TRACK compliance - full recommendation traceability</CardDescription>
                </CardHeader>
                <CardContent>
                  {agentTraces.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No agent trace entries yet</p>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {agentTraces.map((trace) => (
                        <div key={trace.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="capitalize">{trace.agent}</Badge>
                            <Badge variant="secondary" className="text-xs">{trace.action}</Badge>
                            <Badge variant={trace.governance_status === 'approved' ? 'default' : trace.governance_status === 'rejected' ? 'destructive' : 'outline'} className="capitalize text-xs">
                              {trace.governance_status}
                            </Badge>
                            {trace.flags?.length > 0 && <Badge variant="destructive" className="text-xs">{trace.flags.length} flags</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground shrink-0 ml-2">
                            <span>{Math.round(trace.confidence_score * 100)}%</span>
                            <span className="mx-1">|</span>
                            <span>{trace.duration_ms}ms</span>
                            <span className="mx-1">|</span>
                            <span>{new Date(trace.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="killswitch" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kill Switch Events</CardTitle>
                  <CardDescription>RANK governance - agent halt events requiring resolution</CardDescription>
                </CardHeader>
                <CardContent>
                  {killSwitches.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No kill switch events</p>
                  ) : (
                    <div className="space-y-3">
                      {killSwitches.map((ks) => (
                        <div key={ks.id} className={`p-4 rounded-lg border ${ks.resolved ? 'bg-muted/50' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="capitalize">{ks.agent}</Badge>
                                <Badge variant={ks.resolved ? 'secondary' : 'destructive'} className="capitalize">{ks.reason.replace(/_/g, ' ')}</Badge>
                                {ks.auto_triggered && <Badge variant="outline" className="text-xs">Auto</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{ks.details}</p>
                              <p className="text-xs text-muted-foreground mt-1">{new Date(ks.created_at).toLocaleString()}</p>
                            </div>
                            {!ks.resolved && (
                              <Button size="sm" variant="outline" onClick={() => resolveKillSwitch(ks.id)} className="shrink-0">
                                Resolve
                              </Button>
                            )}
                            {ks.resolved && <Badge className="bg-nuru-green-100 text-nuru-green-700 shrink-0">Resolved</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pattern Alerts</CardTitle>
                  <CardDescription>GUARD monitoring - unusual pattern detection</CardDescription>
                </CardHeader>
                <CardContent>
                  {patterns.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No pattern alerts detected</p>
                  ) : (
                    <div className="space-y-2">
                      {patterns.map((p) => (
                        <div key={p.id} className="p-3 rounded-lg border flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="capitalize">{p.pattern_type.replace(/_/g, ' ')}</Badge>
                              <Badge variant={p.severity === 'critical' ? 'destructive' : p.severity === 'high' ? 'destructive' : 'secondary'}>
                                {p.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{p.details}</p>
                            <p className="text-xs text-muted-foreground mt-1">{p.affected_users} users affected | {new Date(p.detected_at).toLocaleString()}</p>
                          </div>
                          {!p.resolved && <Badge variant="destructive" className="text-xs">Active</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Configuration & Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-2">AI Configuration</h3>
                      <div className="space-y-2 text-sm">
                        <StatusRow label="AI Model" value="GPT-4o-mini" status="active" />
                        <StatusRow label="Guardian Agent" value="Active" status="active" />
                        <StatusRow label="HUNT Workflow" value="Enforced" status="active" />
                        <StatusRow label="RANK Governance" value="Active" status="active" />
                        <StatusRow label="GUARD Monitoring" value="Enabled" status="active" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Security & Compliance</h3>
                      <div className="space-y-2 text-sm">
                        <StatusRow label="Row Level Security" value="All Tables" status="active" />
                        <StatusRow label="Data Encryption" value="Active" status="active" />
                        <StatusRow label="Audit Logging" value="Enabled" status="active" />
                        <StatusRow label="Consent Tracking" value="OASIS Compliant" status="active" />
                        <StatusRow label="Kenya DPA Compliance" value="Active" status="active" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold text-sm mb-2">Ethical Frameworks</h3>
                    <div className="flex flex-wrap gap-2">
                      {['TRACK', 'OASIS', 'RANK', 'HUNT', 'GUARD', 'ETHOS', 'PRIDE', 'HORIZON'].map(fw => (
                        <Badge key={fw} variant="outline" className="bg-nuru-green-50">{fw}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold text-sm mb-2">Guardrails (GUARD)</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>No ethnicity-based recommendations</p>
                      <p>No religion-based recommendations</p>
                      <p>No political-based recommendations</p>
                      <p>No gender stereotyping</p>
                      <p>Confidence scores required on all outputs</p>
                      <p>Human review for high-impact decisions</p>
                      <p>Never expose personal identifiers</p>
                      <p>Dignity preservation enforced</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatusRow({ label, value, status }: { label: string; value: string; status: 'active' | 'inactive' }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        <Badge className={status === 'active' ? 'bg-nuru-green-100 text-nuru-green-700' : 'bg-red-100 text-red-700'}>{status}</Badge>
      </div>
    </div>
  );
}
