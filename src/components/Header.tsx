import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print-hidden">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="hidden font-bold sm:inline-block font-headline">
              VidyaNav-ai
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <span className="text-lg font-semibold text-foreground">{title}</span>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex-1 md:hidden">
            <span className="text-lg font-semibold text-foreground">{title}</span>
          </div>
          <nav className="flex items-center">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Home</span>
                </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
