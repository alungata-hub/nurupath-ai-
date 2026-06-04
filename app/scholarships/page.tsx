'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, ExternalLink, Loader2, ArrowRight, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import type { Scholarship } from '@/lib/types';

export default function ScholarshipsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState('');
  const [approved, setApproved] = useState(true);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  const searchScholarships = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      if (result.data) {
        setMatches(result.data.matches || []);
        setReasoning(result.data.reasoning || '');
        setApproved(result.data.guardian_approved);
        setConfidence(result.data.confidence_score || 0);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to search scholarships';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-nuru-green-800 flex items-center gap-2">
              <GraduationCap className="h-6 w-6" /> Scholarship Matcher
            </h1>
            <p className="text-muted-foreground mt-1">Find funding opportunities matched to your profile</p>
          </div>

          {matches.length === 0 && !loading && (
            <Card className="text-center">
              <CardContent className="p-12">
                <Search className="h-12 w-12 text-nuru-gold-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Find Your Scholarships</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Our AI will analyze your profile to find the best scholarship and funding opportunities for you.
                </p>
                <Button onClick={searchScholarships} className="bg-nuru-gold-600 hover:bg-nuru-gold-700 text-white">
                  Search Scholarships <GraduationCap className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card className="text-center">
              <CardContent className="p-12">
                <Loader2 className="h-8 w-8 animate-spin text-nuru-gold-600 mx-auto mb-4" />
                <h2 className="text-lg font-semibold">Searching for scholarships...</h2>
                <p className="text-sm text-muted-foreground">Our AI agents are analyzing your profile and matching funding opportunities</p>
              </CardContent>
            </Card>
          )}

          {matches.length > 0 && !loading && (
            <>
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {approved ? (
                      <Badge className="bg-nuru-green-100 text-nuru-green-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Guardian Approved</Badge>
                    ) : (
                      <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Under Review</Badge>
                    )}
                    <Badge variant="outline">{matches.length} matches found</Badge>
                    <Badge variant="outline">Confidence: {Math.round(confidence * 100)}%</Badge>
                  </div>
                  {reasoning && <p className="text-sm text-muted-foreground mt-2">{reasoning}</p>}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((scholarship, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-nuru-green-800">{scholarship.name}</h3>
                          <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
                        </div>
                        <Badge className="bg-nuru-gold-100 text-nuru-gold-700">{scholarship.match_score}% match</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{scholarship.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="font-medium">{scholarship.amount}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Deadline:</span><span className="font-medium">{scholarship.deadline}</span></div>
                      </div>
                      {scholarship.eligibility_met && scholarship.eligibility_met.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-nuru-green-600 mb-1">Criteria you meet:</p>
                          <div className="flex flex-wrap gap-1">
                            {scholarship.eligibility_met.map((c, j) => (
                              <Badge key={j} variant="outline" className="text-xs bg-nuru-green-50">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {scholarship.url && (
                        <Button variant="link" className="mt-3 p-0 text-nuru-gold-600" asChild>
                          <a href={scholarship.url} target="_blank" rel="noopener noreferrer">
                            Learn More <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button variant="outline" onClick={searchScholarships}>
                  Refresh Matches
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
