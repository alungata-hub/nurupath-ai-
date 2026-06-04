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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Loader2, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import type { SkillGap, RoadmapItem, Course } from '@/lib/types';

export default function SkillsGapPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gapScore, setGapScore] = useState(0);
  const [gapAnalysis, setGapAnalysis] = useState<SkillGap[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [reasoning, setReasoning] = useState('');
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    } else {
      fetchExistingReport();
    }
  }, [user, router]);

  const fetchExistingReport = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/dashboard?user_id=${user!.id}`);
      const result = await res.json();
      if (result.data?.skillsReport) {
        const report = result.data.skillsReport;
        setGapScore(report.gap_score);
        setGapAnalysis(report.gap_analysis || []);
        setRoadmap(report.learning_roadmap || []);
        setCourses(report.recommended_courses || []);
        setConfidence(report.confidence_score);
        setReasoning(report.reasoning || '');
        setHasData(true);
      }
    } catch {
      // silent
    }
  };

  const runAnalysis = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const targetCareer = 'Technology'; // Default; could be dynamic from career recommendations
      const res = await fetch('/api/skills-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, target_career: targetCareer }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      if (result.data) {
        setGapScore(result.data.gap_score);
        setGapAnalysis(result.data.gap_analysis || []);
        setRoadmap(result.data.learning_roadmap || []);
        setCourses(result.data.recommended_courses || []);
        setConfidence(result.data.confidence_score);
        setReasoning(result.data.reasoning || '');
        setHasData(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'important': return 'bg-nuru-gold-100 text-nuru-gold-700 border-nuru-gold-200';
      default: return 'bg-nuru-green-100 text-nuru-green-700 border-nuru-green-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-nuru-green-800 flex items-center gap-2">
              <Target className="h-6 w-6" /> Skills Gap Analysis
            </h1>
            <p className="text-muted-foreground mt-1">Identify your skill gaps and get a personalized learning roadmap</p>
          </div>

          {!hasData && !loading && (
            <Card className="text-center">
              <CardContent className="p-12">
                <Target className="h-12 w-12 text-nuru-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Analyze Your Skills Gap</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Our AI will compare your current skills against your target career requirements and create a learning roadmap.
                </p>
                <Button onClick={runAnalysis} className="bg-nuru-green-600 hover:bg-nuru-green-700">
                  Start Analysis <Target className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card className="text-center">
              <CardContent className="p-12">
                <Loader2 className="h-8 w-8 animate-spin text-nuru-green-600 mx-auto mb-4" />
                <h2 className="text-lg font-semibold">Analyzing your skills...</h2>
                <p className="text-sm text-muted-foreground">Our Skills Agent is comparing your profile with career requirements</p>
              </CardContent>
            </Card>
          )}

          {hasData && !loading && (
            <>
              {/* Gap Score */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-nuru-green-700">{Math.round(100 - gapScore)}%</div>
                      <div className="text-sm text-muted-foreground">Skills Aligned</div>
                    </div>
                    <div className="flex-1">
                      <Progress value={100 - gapScore} className="h-4 mb-2" />
                      <p className="text-sm text-muted-foreground">{reasoning}</p>
                    </div>
                    <Badge variant="outline">Confidence: {Math.round(confidence * 100)}%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="gaps">
                <TabsList>
                  <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
                  <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
                  <TabsTrigger value="courses">Recommended Courses</TabsTrigger>
                </TabsList>

                <TabsContent value="gaps" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gapAnalysis.map((gap, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{gap.skill}</h3>
                            <Badge className={priorityColor(gap.priority)}>{gap.priority}</Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Current Level</span>
                                <span>{gap.current_level}/5</span>
                              </div>
                              <Progress value={gap.current_level * 20} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Required Level</span>
                                <span>{gap.required_level}/5</span>
                              </div>
                              <Progress value={gap.required_level * 20} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="roadmap" className="mt-4">
                  <div className="space-y-4">
                    {roadmap.map((item, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-nuru-green-100 text-nuru-green-700 text-sm font-bold shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <Badge variant="outline" className="mb-1">{item.phase}</Badge>
                              <h3 className="font-semibold">{item.skill}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Resource: {item.resource}</span>
                                <span>Duration: {item.duration}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="courses" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{course.name}</h3>
                              <p className="text-sm text-muted-foreground">{course.provider}</p>
                            </div>
                            <Badge variant="outline">{course.platform}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{course.relevance}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Duration: {course.duration}</span>
                            <span>Cost: {course.cost}</span>
                          </div>
                          {course.url && (
                            <Button variant="link" className="mt-2 p-0 text-nuru-green-600" asChild>
                              <a href={course.url} target="_blank" rel="noopener noreferrer">
                                View Course <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <Button variant="outline" onClick={runAnalysis}>Refresh Analysis</Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
