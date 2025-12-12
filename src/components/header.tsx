import { Icons } from '@/components/icons';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <Icons.logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          WAEC Tutor AI
        </h1>
      </div>
    </header>
  );
}
