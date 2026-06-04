'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Compass, GraduationCap, Target, FileText, Users, Shield,
  ArrowRight, BarChart3, BookOpen, Lightbulb, CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-nuru-green-800 via-nuru-green-700 to-nuru-green-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4djM2YzkuOTQgMCAxOC04LjA2IDE4LTE4em0tMzYgMGMwIDkuOTQgOC4wNiAxOCAxOCAxOFYwQzguMDYgMCAwIDguMDYgMCAxOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nuru-gold-500/20 border border-nuru-gold-500/30 text-nuru-gold-300 text-sm mb-6">
              <Lightbulb className="h-4 w-4" />
              AI-Powered Career Navigation
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Find Your Path. <br />
              <span className="text-nuru-gold-400">Shape Your Future.</span>
            </h1>
            <p className="text-lg md:text-xl text-nuru-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              NuruPath AI helps Kenyan students, TVET learners, and graduates discover personalized
              education-to-employment pathways based on your interests, strengths, and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="bg-nuru-gold-500 hover:bg-nuru-gold-600 text-black font-semibold h-12 px-8">
                <Link href="/auth/signup">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 h-12 px-8">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-nuru-green-800 mb-4">
              Your Complete Career Navigation Toolkit
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From assessment to action, NuruPath AI provides everything you need to navigate your career journey with confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Compass className="h-6 w-6" />}
              title="Career Assessment"
              description="Answer targeted questions and receive AI-powered career pathway recommendations tailored to your unique profile."
              color="green"
            />
            <FeatureCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Scholarship Matcher"
              description="Discover funding opportunities matched to your education level, location, and financial situation."
              color="gold"
            />
            <FeatureCard
              icon={<Target className="h-6 w-6" />}
              title="Skills Gap Analysis"
              description="Identify the gap between your current skills and career requirements, with a personalized learning roadmap."
              color="green"
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Career Action Plan"
              description="Get a structured 30-day, 90-day, and 1-year plan to move from where you are to where you want to be."
              color="gold"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Counselor Support"
              description="Connect with qualified career counselors who review AI recommendations and provide expert guidance."
              color="green"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Ethical AI"
              description="Every recommendation is reviewed by our Guardian Agent for safety, bias, and accuracy before reaching you."
              color="gold"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-nuru-green-800 mb-4">How NuruPath Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StepCard step={1} title="Create Profile" description="Tell us about your education, interests, and goals" />
            <StepCard step={2} title="Take Assessment" description="Answer 15 questions about your strengths and preferences" />
            <StepCard step={3} title="Get Recommendations" description="AI analyzes your profile and generates career pathways" />
            <StepCard step={4} title="Take Action" description="Follow your personalized plan with counselor support" />
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-20 bg-nuru-green-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="47" label="Kenyan Counties Covered" />
            <StatCard number="200+" label="Career Pathways" />
            <StatCard number="50+" label="Scholarship Programs" />
            <StatCard number="15" label="Emerging Career Sectors" />
          </div>
        </div>
      </section>

      {/* TRACK/OASIS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-nuru-green-800 mb-4">Built on Ethical Foundations</h2>
            <p className="text-muted-foreground">Our AI system follows rigorous ethical frameworks</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-nuru-green-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-nuru-green-700 mb-4">TRACK Framework</h3>
                <ul className="space-y-3">
                  <EthicsItem label="Transparency" desc="Clear about how recommendations are generated" />
                  <EthicsItem label="Responsibility" desc="Accountable for AI outputs and their impact" />
                  <EthicsItem label="Auditability" desc="Every recommendation is traceable and logged" />
                  <EthicsItem label="Compliance" desc="Meets Kenya Data Protection Act requirements" />
                  <EthicsItem label="Knowledge Stewardship" desc="Protecting and respecting user data" />
                </ul>
              </CardContent>
            </Card>
            <Card className="border-nuru-gold-400">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-nuru-gold-600 mb-4">OASIS Principles</h3>
                <ul className="space-y-3">
                  <EthicsItem label="Ownership" desc="You own your data, always" />
                  <EthicsItem label="Access" desc="Full access to your information and recommendations" />
                  <EthicsItem label="Security" desc="Encrypted data with strict access controls" />
                  <EthicsItem label="Informed Consent" desc="You choose how your data is used" />
                  <EthicsItem label="Sovereignty" desc="Your data stays under your control" />
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-nuru-green-700 to-nuru-green-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Navigate Your Future?</h2>
          <p className="text-nuru-green-100 mb-8 max-w-xl mx-auto">
            Join thousands of Kenyan youth discovering their path with AI-powered guidance.
          </p>
          <Button size="lg" asChild className="bg-nuru-gold-500 hover:bg-nuru-gold-600 text-black font-semibold h-12 px-8">
            <Link href="/auth/signup">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t bg-muted/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NuruPath AI. Built for Kenya&apos;s youth. TRACK &amp; OASIS Compliant.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: 'green' | 'gold' }) {
  const bgClass = color === 'green' ? 'bg-nuru-green-50 text-nuru-green-600' : 'bg-nuru-gold-50 text-nuru-gold-600';
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className={`inline-flex items-center justify-center h-12 w-12 rounded-lg ${bgClass} mb-4 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-nuru-green-600 text-white font-bold text-lg mb-4">
        {step}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-nuru-gold-400 mb-2">{number}</div>
      <div className="text-sm text-nuru-green-200">{label}</div>
    </div>
  );
}

function EthicsItem({ label, desc }: { label: string; desc: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 text-nuru-green-500 mt-0.5 shrink-0" />
      <div><span className="font-medium text-sm">{label}</span> <span className="text-sm text-muted-foreground">- {desc}</span></div>
    </li>
  );
}
