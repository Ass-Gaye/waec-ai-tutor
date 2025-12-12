import type { LucideProps } from 'lucide-react';
import { Atom, BookOpen, Calculator, Dna, FlaskConical } from 'lucide-react';

export const Icons = {
  logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 10.5V12a10 10 0 1 1-5.93-9.14" />
      <path d="M9 11a3 3 0 0 1 5.64-1.59" />
      <path d="m22 2-5 5" />
      <path d="m17 2 5 5" />
    </svg>
  ),
  math: Calculator,
  english: BookOpen,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
};
