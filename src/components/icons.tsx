import type { LucideProps } from 'lucide-react';
import { Atom, BookOpen, Calculator, Dna, FlaskConical } from 'lucide-react';

export const Icons = {
  logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary) / 0.5)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#logo-gradient)" stroke="none" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
      <path d="M12 22V12" />
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" className="text-primary-foreground" fill="hsl(var(--background))" />
    </svg>
  ),
  math: Calculator,
  english: BookOpen,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
};
