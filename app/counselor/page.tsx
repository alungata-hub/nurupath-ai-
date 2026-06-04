'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckCircle2, XCircle, MessageSquare, Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface StudentSummary {
  profile: {
    user_id: string;
    full_name: string;
    county: string;
    education_level: string;
    career_interests: string[];
  };
  has_assessment: boolean;
  has_career_rec: boolean;
  latest_career_approved: boolean | null;
  counselor_notes_count: number;
}

export default function CounselorPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [note, setNote] = useState('');
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    } else if (profile?.role !== 'counselor' && profile?.role !== 'admin') {
      router.push('/dashboard');
    } else {
      fetchStudents();
    }
  }, [user, profile, router]);

  const fetchStudents = async () => {
    if (!user) return;
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, county, education_level, career_interests, counselor_id')
        .eq('role', 'student')
        .limit(50);

      if (profiles) {
        const summaries: StudentSummary[] = await Promise.all(
          profiles.map(async (p) => {
            const [{ count: assessmentCount }, { data: careerRec }, { count: notesCount }] = await Promise.all([
              supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('user_id', p.user_id),
              supabase.from('career_recommendations').select('guardian_approved').eq('user_id', p.user_id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
              supabase.from('counselor_notes').select('*', { count: 'exact', head: true }).eq('student_id', p.user_id),
            ]);

            return {
              profile: p,
              has_assessment: (assessmentCount || 0) > 0,
              has_career_rec: !!careerRec,
              latest_career_approved: careerRec?.guardian_approved ?? null,
              counselor_notes_count: notesCount || 0,
            };
          })
        );
        setStudents(summaries);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!user || !selectedStudent || !note.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('counselor_notes').insert({
        counselor_id: user.id,
        student_id: selectedStudent.profile.user_id,
        recommendation_type: 'career',
        recommendation_id: 'general',
        comment: note,
        approved,
      });

      if (error) throw error;
      toast.success('Note saved successfully');
      setNote('');
      setApproved(false);
      fetchStudents();
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
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
              <Users className="h-6 w-6" /> Counselor Portal
            </h1>
            <p className="text-muted-foreground mt-1">Review and provide guidance on student career recommendations</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Students</CardTitle>
                  <CardDescription>{students.length} students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {students.map((s) => (
                      <div
                        key={s.profile.user_id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-nuru-green-50 ${selectedStudent?.profile.user_id === s.profile.user_id ? 'border-nuru-green-300 bg-nuru-green-50' : ''}`}
                        onClick={() => setSelectedStudent(s)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{s.profile.full_name}</span>
                          <div className="flex gap-1">
                            {s.has_assessment && <Badge variant="outline" className="text-xs bg-nuru-green-50">Assessed</Badge>}
                            {s.latest_career_approved && <Badge className="text-xs bg-nuru-green-100 text-nuru-green-700">Approved</Badge>}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {s.profile.county} | {s.profile.education_level}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Detail & Notes */}
            <div className="lg:col-span-2">
              {selectedStudent ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedStudent.profile.full_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">County</p>
                          <p className="font-medium">{selectedStudent.profile.county}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Education</p>
                          <p className="font-medium">{selectedStudent.profile.education_level}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Interests</p>
                          <p className="font-medium">{selectedStudent.profile.career_interests?.join(', ') || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <div className="flex gap-1">
                            {selectedStudent.has_assessment ? (
                              <Badge className="bg-nuru-green-100 text-nuru-green-700">Assessed</Badge>
                            ) : (
                              <Badge variant="outline">Not Assessed</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add Counselor Note</CardTitle>
                      <CardDescription>Review AI recommendations and provide expert guidance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Provide your professional assessment and guidance for this student..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={4}
                        />
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="approve"
                              checked={approved}
                              onChange={(e) => setApproved(e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor="approve" className="text-sm">Approve AI Recommendations</Label>
                          </div>
                          <Button
                            onClick={saveNote}
                            disabled={!note.trim() || saving}
                            className="bg-nuru-green-600 hover:bg-nuru-green-700"
                          >
                            {saving ? 'Saving...' : 'Save Note'} <MessageSquare className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="text-center">
                  <CardContent className="p-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Select a Student</h2>
                    <p className="text-muted-foreground">Choose a student from the list to review their profile and recommendations</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Label({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return <label htmlFor={htmlFor} className={className}>{children}</label>;
}
