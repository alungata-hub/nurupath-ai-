import { Compass } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-nuru-green-600 text-white font-bold text-xs">N</div>
              <span className="font-bold text-nuru-green-800">NuruPath AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered career navigation for Kenya&apos;s next generation of leaders.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Career Assessment</li>
              <li>Scholarship Finder</li>
              <li>Skills Analysis</li>
              <li>Action Plans</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>TVET Programs</li>
              <li>University Guide</li>
              <li>Labor Market Data</li>
              <li>Career Counselors</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Compliance</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Data Protection (GDPR/Kenya DPA)</li>
              <li>AI Ethics Framework</li>
              <li>Consent Management</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NuruPath AI. Built for Kenya&apos;s youth.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Compass className="h-3 w-3 text-nuru-green-600" />
            <span>TRACK &amp; OASIS Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
