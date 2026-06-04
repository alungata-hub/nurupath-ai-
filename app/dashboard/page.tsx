'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Compass, GraduationCap, Target, FileText, LayoutDashboard,
  ArrowRight, CheckCircle2, AlertCircle, Loader2, User,
  Bell, Shield, AlertTriangle,
} from 'lucide-react';
import type { DashboardData, Notification } from '@/lib/types';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/dashboard?user_id=${user!.id}`);
      const result = await res.json();
      if (result.data) {
        setData(result.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (type: 'career' | 'scholarship' | 'skills' | 'action_plan') => {
    if (!user) return;
    setAnalyzing(true);
    try {
      let endpoint = '';
      let body: Record<string, string> = { user_id: user.id };

      switch (type) {
        case 'career':
          endpoint = '/api/career-analysis';
          break;
        case 'scholarship':
          endpoint = '/api/scholarships';
          break;
        case 'skills':
          endpoint = '/api/skills-gap';
          body.target_career = data?.careerRecommendation?.top_pathways?.[0]?.title || 'Technology';
          break;
        case 'action_plan':
          endpoint = '/api/action-plan';
          body.career_path = data?.careerRecommendation?.top_pathways?.[0]?.title || 'Technology';
          break;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.error) {
        throw new Error(result.error);
      }
      await fetchDashboard();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      alert(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const unreadNotifications = (data?.notifications || []).filter((n: Notification) => !n.read);
  const criticalNotifications = unreadNotifications.filter((n: Notification) => n.priority === 'critical');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nuru-green-600" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const hasAssessment = !!data?.latestAssessment;
  const hasCareerRec = !!data?.careerRecommendation;
  const hasScholarship = !!data?.scholarshipMatch;
  const hasSkillsReport = !!data?.skillsReport;
  const hasActionPlan = !!data?.actionPlan;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-nuru-green-800">Welcome, {profile.full_name || 'Learner'}</h1>
              <p className="text-muted-foreground mt-1">Your career navigation dashboard</p>
            </div>
            {unreadNotifications.length > 0 && (
              <Button variant="outline" size="sm" className="relative" onClick={() => {}}>
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Critical Notifications */}
          {criticalNotifications.length > 0 && (
            <div className="mb-6 space-y-2">
              {criticalNotifications.map((n: Notification) => (
                <Card key={n.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-red-800 text-sm">{n.title}</p>
                      <p className="text-xs text-red-600 mt-1">{n.message}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">{n.priority}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Kill switch / governance pause alert */}
          {data?.careerRecommendation?.governance_status === 'killed' && (
            <Card className="mb-6 border-red-300 bg-red-50">
              <CardContent className="p-4 flex items-center gap-3">
                <Shield className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-bold text-red-800">AI Processing Halted for Your Safety</p>
                  <p className="text-sm text-red-600 mt-1">
                    The Guardian Agent detected a safety concern and paused recommendation generation. A career counselor will review your results before they are released.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Completion */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-nuru-green-600" />
                  <span className="font-medium">Profile Completion</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {profile.onboarding_completed ? 'Complete' : 'Incomplete'}
                </span>
              </div>
              <Progress value={profile.onboarding_completed ? 100 : 40} className="h-2" />
              {!profile.onboarding_completed && (
                <Button variant="link" className="mt-2 p-0 text-nuru-green-600" onClick={() => router.push('/onboarding')}>
                  Complete your profile <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <ActionCard
              icon={<Compass className="h-5 w-5" />}
              title="Assessment"
              description={hasAssessment ? 'Retake' : 'Start'}
              completed={hasAssessment}
              onClick={() => router.push('/assessment')}
              color="green"
            />
            <ActionCard
              icon={<Target className="h-5 w-5" />}
              title="Career Paths"
              description={hasCareerRec ? 'View' : 'Generate'}
              completed={hasCareerRec}
              onClick={() => hasAssessment ? runAnalysis('career') : router.push('/assessment')}
              loading={analyzing}
              color="green"
            />
            <ActionCard
              icon={<GraduationCap className="h-5 w-5" />}
              title="Scholarships"
              description={hasScholarship ? 'View' : 'Search'}
              completed={hasScholarship}
              onClick={() => hasAssessment ? runAnalysis('scholarship') : router.push('/assessment')}
              loading={analyzing}
              color="gold"
            />
            <ActionCard
              icon={<FileText className="h-5 w-5" />}
              title="Action Plan"
              description={hasActionPlan ? 'View' : 'Generate'}
              completed={hasActionPlan}
              onClick={() => hasCareerRec ? runAnalysis('action_plan') : hasAssessment ? runAnalysis('career') : router.push('/assessment')}
              loading={analyzing}
              color="gold"
            />
          </div>

          {/* Career Recommendations */}
          {hasCareerRec && data.careerRecommendation && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-nuru-green-600" />
                      Your Top Career Pathways
                    </CardTitle>
                    <CardDescription>AI-recommended career paths based on your profile</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {data.careerRecommendation.guardian_approved ? (
                      <Badge className="bg-nuru-green-100 text-nuru-green-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Guardian Approved</Badge>
                    ) : (
                      <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Under Review</Badge>
                    )}
                    <Badge variant="outline">Confidence: {Math.round(data.careerRecommendation.confidence_score * 100)}%</Badge>
                    {data.careerRecommendation.governance_status && (
                      <Badge variant="outline" className="capitalize">{data.careerRecommendation.governance_status}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(data.careerRecommendation.top_pathways as Array<{title: string; description: string; match_score: number; sector: string; demand_level: string; avg_salary: string}>).map((path, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-nuru-green-600">#{i + 1}</Badge>
                        <span className="text-sm font-medium text-nuru-green-600">{path.match_score}% match</span>
                      </div>
                      <h3 className="font-semibold mb-1">{path.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Sector:</span><span className="font-medium">{path.sector}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Demand:</span><span className="font-medium">{path.demand_level}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Avg Salary:</span><span className="font-medium">{path.avg_salary}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Gap Summary */}
          {hasSkillsReport && data.skillsReport && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-nuru-gold-600" />
                  Skills Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-nuru-gold-600">{Math.round(data.skillsReport.gap_score)}%</div>
                    <div className="text-xs text-muted-foreground">Gap Score</div>
                  </div>
                  <Progress value={100 - data.skillsReport.gap_score} className="flex-1 h-3" />
                  <span className="text-sm text-muted-foreground">{100 - Math.round(data.skillsReport.gap_score)}% aligned</span>
                </div>
                <Button variant="outline" onClick={() => router.push('/skills-gap')}>
                  View Full Analysis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {unreadNotifications.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-nuru-gold-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unreadNotifications.slice(0, 5).map((n: Notification) => (
                    <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Badge variant={n.priority === 'critical' ? 'destructive' : n.priority === 'warning' ? 'outline' : 'secondary'} className="shrink-0 capitalize text-xs">
                        {n.priority}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Counselor Notes */}
          {data?.counselorNotes && data.counselorNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Counselor Feedback</CardTitle>
                <CardDescription>Notes from your career counselor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.counselorNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">{note.recommendation_type}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm">{note.comment}</p>
                      {note.approved && <Badge className="mt-2 bg-nuru-green-100 text-nuru-green-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!hasAssessment && (
            <Card className="text-center">
              <CardContent className="p-12">
                <Compass className="h-12 w-12 text-nuru-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-nuru-green-800 mb-2">Start Your Journey</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Complete your career assessment to unlock personalized recommendations, scholarship matches, and action plans.
                </p>
                <Button onClick={() => router.push('/assessment')} className="bg-nuru-green-600 hover:bg-nuru-green-700">
                  Take Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ActionCard({ icon, title, description, completed, onClick, loading, color }: {
  icon: React.ReactNode; title: string; description: string; completed: boolean; onClick: () => void; loading?: boolean; color: 'green' | 'gold';
}) {
  const bgClass = color === 'green' ? 'bg-nuru-green-50 text-nuru-green-600' : 'bg-nuru-gold-50 text-nuru-gold-600';
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={loading ? undefined : onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${bgClass}`}>{icon}</div>
          {completed && <CheckCircle2 className="h-4 w-4 text-nuru-green-600" />}
        </div>
        <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-nuru-green-600 mt-2" />}
      </CardContent>
    </Card>
  );
}
