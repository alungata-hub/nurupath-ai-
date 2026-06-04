import { Compass, GraduationCap, Target, FileText, Shield, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-nuru-green-800 to-nuru-green-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">About NuruPath AI</h1>
          <p className="text-nuru-green-100 max-w-2xl mx-auto text-lg">
            An AI-powered career navigation platform designed to help Kenyan youth identify and pursue
            education-to-employment pathways that match their unique strengths, interests, and circumstances.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-nuru-green-800 mb-8 text-center">Our Mission</h2>
          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Kenya has one of the youngest populations in the world, with over 75% of citizens under 35.
              Yet many young people lack access to career guidance that reflects their realities - their
              county, their financial constraints, their actual skills, and the real opportunities available.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              NuruPath AI bridges this gap. We use artificial intelligence - guided by human expertise and
              ethical guardrails - to create personalized career navigation that respects each learner&apos;s
              unique context and potential.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-nuru-green-800 mb-8 text-center">Multi-Agent AI System</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <AgentCard name="Scout Agent" desc="Analyzes learner profiles and identifies key strengths and constraints" icon={<Target className="h-5 w-5" />} />
            <AgentCard name="Pathfinder Agent" desc="Generates personalized career pathways based on assessment results" icon={<Compass className="h-5 w-5" />} />
            <AgentCard name="Scholarship Agent" desc="Matches learners with relevant funding and scholarship opportunities" icon={<GraduationCap className="h-5 w-5" />} />
            <AgentCard name="Skills Agent" desc="Identifies skill gaps and creates learning roadmaps" icon={<FileText className="h-5 w-5" />} />
            <AgentCard name="Guardian Agent" desc="Reviews all outputs for safety, bias, and accuracy before delivery" icon={<Shield className="h-5 w-5" />} />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Only the Guardian Agent can finalize recommendations. Every output passes through safety review.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-nuru-green-800 mb-8 text-center">Ethical Framework</h2>
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

      <footer className="border-t bg-muted/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NuruPath AI. Built for Kenya&apos;s youth.
        </div>
      </footer>
    </div>
  );
}

function AgentCard({ name, desc, icon }: { name: string; desc: string; icon: React.ReactNode }) {
  return (
    <Card className="text-center hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-nuru-green-50 text-nuru-green-600 mb-3">
          {icon}
        </div>
        <h3 className="font-semibold text-sm mb-1">{name}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function EthicsItem({ label, desc }: { label: string; desc: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 text-nuru-green-500 mt-0.5 shrink-0" />
      <div><span className="font-medium text-sm">{label}</span> - <span className="text-sm text-muted-foreground">{desc}</span></div>
    </li>
  );
}
