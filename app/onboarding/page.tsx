'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { KENYAN_COUNTIES, EDUCATION_LEVELS, CAREER_CATEGORIES, SKILLS_LIST, LANGUAGE_PREFERENCES } from '@/lib/constants';
import { toast } from 'sonner';

const STEPS = ['Personal Info', 'Education', 'Interests & Skills', 'Constraints', 'Consent'];

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age?.toString() || '',
    county: profile?.county || '',
    sub_county: '',
    gender: profile?.gender || '',
    education_level: profile?.education_level || '',
    academic_performance: '',
    career_interests: profile?.career_interests || [] as string[],
    skills: profile?.skills || [] as string[],
    financial_constraints: '',
    language_preference: profile?.language_preference || 'en',
    consent_data: false,
    consent_ai: false,
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleArrayItem = (field: 'career_interests' | 'skills', value: string) => {
    const current = form[field] as string[];
    setForm({
      ...form,
      [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: form.full_name,
          age: form.age ? parseInt(form.age) : null,
          county: form.county,
          sub_county: form.sub_county,
          gender: form.gender,
          education_level: form.education_level,
          academic_performance: form.academic_performance,
          career_interests: form.career_interests,
          skills: form.skills,
          financial_constraints: form.financial_constraints,
          language_preference: form.language_preference,
          onboarding_completed: true,
          role: profile?.role || 'student',
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Record consent
      if (form.consent_data) {
        await supabase.from('consent_records').insert({
          user_id: user.id,
          consent_type: 'data_processing',
          consent_given: true,
          consent_text: 'I consent to NuruPath AI collecting and processing my personal data for career guidance purposes.',
        });
      }
      if (form.consent_ai) {
        await supabase.from('consent_records').insert({
          user_id: user.id,
          consent_type: 'ai_recommendations',
          consent_given: true,
          consent_text: 'I understand that career recommendations are AI-generated and should be reviewed with a qualified career counselor.',
        });
      }

      await refreshProfile();
      toast.success('Profile saved successfully!');
      router.push('/assessment');
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return form.full_name && form.county;
      case 1: return form.education_level;
      case 2: return form.career_interests.length > 0;
      case 3: return true;
      case 4: return form.consent_data && form.consent_ai;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nuru-green-50 via-white to-nuru-gold-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-nuru-green-800">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-1">Help us understand your background so we can guide your career journey</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-1 text-xs ${i <= step ? 'text-nuru-green-700 font-medium' : 'text-muted-foreground'}`}>
                {i < step ? <CheckCircle2 className="h-4 w-4 text-nuru-green-600" /> : <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${i === step ? 'bg-nuru-green-600 text-white' : 'bg-muted'}`}>{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]}</CardTitle>
            <CardDescription>
              Step {step + 1} of {STEPS.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Enter your full name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" min="14" max="65" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Your age" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>County *</Label>
                    <Select value={form.county} onValueChange={(v) => setForm({ ...form, county: v })}>
                      <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                      <SelectContent>
                        {KENYAN_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subCounty">Sub-County</Label>
                    <Input id="subCounty" value={form.sub_county} onChange={(e) => setForm({ ...form, sub_county: e.target.value })} placeholder="Your sub-county" />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Education Level *</Label>
                  <Select value={form.education_level} onValueChange={(v) => setForm({ ...form, education_level: v })}>
                    <SelectTrigger><SelectValue placeholder="Select education level" /></SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Academic Performance</Label>
                  <Select value={form.academic_performance} onValueChange={(v) => setForm({ ...form, academic_performance: v })}>
                    <SelectTrigger><SelectValue placeholder="How would you rate your performance?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent (A, A-)</SelectItem>
                      <SelectItem value="good">Good (B+, B, B-)</SelectItem>
                      <SelectItem value="average">Average (C+, C, C-)</SelectItem>
                      <SelectItem value="below_average">Below Average (D+, D, D-)</SelectItem>
                      <SelectItem value="not_applicable">Not applicable yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select value={form.language_preference} onValueChange={(v) => setForm({ ...form, language_preference: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Career Interests * (select at least 1)</Label>
                  <div className="flex flex-wrap gap-2">
                    {CAREER_CATEGORIES.map((cat) => (
                      <Badge
                        key={cat}
                        variant={form.career_interests.includes(cat) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors ${form.career_interests.includes(cat) ? 'bg-nuru-green-600 hover:bg-nuru-green-700' : 'hover:bg-nuru-green-50'}`}
                        onClick={() => toggleArrayItem('career_interests', cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Current Skills (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_LIST.map((skill) => (
                      <Badge
                        key={skill}
                        variant={form.skills.includes(skill) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors ${form.skills.includes(skill) ? 'bg-nuru-gold-600 hover:bg-nuru-gold-700' : 'hover:bg-nuru-gold-50'}`}
                        onClick={() => toggleArrayItem('skills', skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Financial Constraints</Label>
                  <Select value={form.financial_constraints} onValueChange={(v) => setForm({ ...form, financial_constraints: v })}>
                    <SelectTrigger><SelectValue placeholder="Describe your financial situation" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_constraints">No significant constraints</SelectItem>
                      <SelectItem value="need_full_funding">Need full funding for education</SelectItem>
                      <SelectItem value="need_partial_funding">Need partial funding/scholarship</SelectItem>
                      <SelectItem value="can_fund_certificate">Can fund short courses/certificates</SelectItem>
                      <SelectItem value="working_and_studying">Working while studying</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  This information helps us find scholarships and programs that match your financial situation.
                  All data is encrypted and only used for recommendation purposes.
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-nuru-green-50/50">
                    <input type="checkbox" id="consentData2" checked={form.consent_data} onChange={(e) => setForm({ ...form, consent_data: e.target.checked })} className="mt-1 rounded" />
                    <label htmlFor="consentData2" className="text-sm leading-relaxed">
                      <span className="font-medium">Data Processing Consent</span> - I consent to NuruPath AI collecting and processing my personal data (name, education, interests, location) for the purpose of generating career guidance recommendations. I understand my data is protected under the Kenya Data Protection Act 2019 and I can withdraw consent at any time.
                    </label>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-nuru-gold-50/50">
                    <input type="checkbox" id="consentAi2" checked={form.consent_ai} onChange={(e) => setForm({ ...form, consent_ai: e.target.checked })} className="mt-1 rounded" />
                    <label htmlFor="consentAi2" className="text-sm leading-relaxed">
                      <span className="font-medium">AI Recommendation Consent</span> - I understand that career recommendations are generated by artificial intelligence and reviewed by a Guardian Agent for safety. I acknowledge that AI recommendations should be discussed with a qualified career counselor before making major education or career decisions. I understand that all AI processes are logged for audit purposes.
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="bg-nuru-green-600 hover:bg-nuru-green-700">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={!canProceed() || saving} className="bg-nuru-green-600 hover:bg-nuru-green-700">
                  {saving ? 'Saving...' : 'Complete Profile'} <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
