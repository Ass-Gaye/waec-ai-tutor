import type { LucideProps } from 'lucide-react';
import { Atom, BookOpen, Calculator, Dna, FlaskConical, Sparkles } from 'lucide-react';

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
      <path d="m12 3-1.9 4.1-4.1 1.9 4.1 1.9 1.9 4.1 1.9-4.1 4.1-1.9-4.1-1.9Z" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="M12 3v2" />
      <path d="M12 19v2" />
    </svg>
  ),
  math: Calculator,
  english: BookOpen,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
};
