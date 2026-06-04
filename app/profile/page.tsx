'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { KENYAN_COUNTIES, EDUCATION_LEVELS, CAREER_CATEGORIES, SKILLS_LIST } from '@/lib/constants';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    age: '',
    county: '',
    sub_county: '',
    gender: '',
    education_level: '',
    academic_performance: '',
    career_interests: [] as string[],
    skills: [] as string[],
    financial_constraints: '',
    language_preference: 'en',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        age: profile.age?.toString() || '',
        county: profile.county || '',
        sub_county: profile.sub_county || '',
        gender: profile.gender || '',
        education_level: profile.education_level || '',
        academic_performance: profile.academic_performance || '',
        career_interests: profile.career_interests || [],
        skills: profile.skills || [],
        financial_constraints: profile.financial_constraints || '',
        language_preference: profile.language_preference || 'en',
      });
    }
  }, [profile]);

  const toggleArrayItem = (field: 'career_interests' | 'skills', value: string) => {
    const current = form[field];
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
        .update({
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
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-nuru-green-800 flex items-center gap-2">
              <User className="h-6 w-6" /> My Profile
            </h1>
            <p className="text-muted-foreground mt-1">View and update your personal information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your details to get more accurate recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label>County</Label>
                  <Select value={form.county} onValueChange={(v) => setForm({ ...form, county: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {KENYAN_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Select value={form.education_level} onValueChange={(v) => setForm({ ...form, education_level: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Career Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {CAREER_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant={form.career_interests.includes(cat) ? 'default' : 'outline'}
                      className={`cursor-pointer ${form.career_interests.includes(cat) ? 'bg-nuru-green-600' : 'hover:bg-nuru-green-50'}`}
                      onClick={() => toggleArrayItem('career_interests', cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS_LIST.map((skill) => (
                    <Badge
                      key={skill}
                      variant={form.skills.includes(skill) ? 'default' : 'outline'}
                      className={`cursor-pointer ${form.skills.includes(skill) ? 'bg-nuru-gold-600' : 'hover:bg-nuru-gold-50'}`}
                      onClick={() => toggleArrayItem('skills', skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Financial Constraints</Label>
                <Select value={form.financial_constraints} onValueChange={(v) => setForm({ ...form, financial_constraints: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_constraints">No significant constraints</SelectItem>
                    <SelectItem value="need_full_funding">Need full funding</SelectItem>
                    <SelectItem value="need_partial_funding">Need partial funding</SelectItem>
                    <SelectItem value="can_fund_certificate">Can fund short courses</SelectItem>
                    <SelectItem value="working_and_studying">Working while studying</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Role: {profile?.role || 'student'}</span>
                <span>|</span>
                <span>Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>

              <Button onClick={handleSave} disabled={saving} className="bg-nuru-green-600 hover:bg-nuru-green-700">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
