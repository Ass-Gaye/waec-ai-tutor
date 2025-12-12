import { Icons } from '@/components/icons';

export function Header() {
  return (
    <header className="border-b border-white/10 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4">
        <Icons.logo className="h-8 w-8 text-primary" />
        <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-green-300 via-primary to-purple-400 text-transparent bg-clip-text">
          WAEC Tutor AI
        </h1>
      </div>
    </header>
  );
}
