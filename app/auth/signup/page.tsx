'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Shield } from 'lucide-react';
import { KENYAN_COUNTIES } from '@/lib/constants';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consentData, setConsentData] = useState(false);
  const [consentAi, setConsentAi] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    county: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!consentData || !consentAi) {
      setError('You must accept the consent terms to continue');
      return;
    }

    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      full_name: form.fullName,
      role: form.role,
      county: form.county,
    });

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nuru-green-50 via-white to-nuru-gold-50 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-nuru-green-600 text-white font-bold text-lg">N</div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Start your career navigation journey</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Enter your full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student / Youth</SelectItem>
                    <SelectItem value="counselor">Career Counselor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>County</Label>
                <Select value={form.county} onValueChange={(v) => setForm({ ...form, county: v })}>
                  <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                  <SelectContent>
                    {KENYAN_COUNTIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <input type="checkbox" id="consentData" checked={consentData} onChange={(e) => setConsentData(e.target.checked)} className="mt-1 rounded border-gray-300" />
                <label htmlFor="consentData" className="text-sm text-muted-foreground">
                  I consent to NuruPath AI collecting and processing my personal data for career guidance purposes, in compliance with the Kenya Data Protection Act.
                </label>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="consentAi" checked={consentAi} onChange={(e) => setConsentAi(e.target.checked)} className="mt-1 rounded border-gray-300" />
                <label htmlFor="consentAi" className="text-sm text-muted-foreground">
                  I understand that career recommendations are AI-generated and should be reviewed with a qualified career counselor before making major decisions.
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-nuru-green-600 hover:bg-nuru-green-700" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-nuru-green-600 hover:underline font-medium">Sign in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
