'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-16 w-16 text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <h1 className="text-5xl md:text-7xl font-bold font-headline text-primary tracking-tight">
              VidyaNav-ai
            </h1>
          </div>
          <p className="text-lg md:text-xl text-foreground/80 mt-4">
            Your AI Partner for Multi-Grade Classrooms in Rural Areas
          </p>
        </div>
        <Button asChild size="lg" className="mt-8 text-lg">
          <Link href="/assistant">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Made for teachers in rural areas.</p>
      </footer>
    </div>
  );
}
