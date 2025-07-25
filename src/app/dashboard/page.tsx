import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, BrainCircuit, Palette, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="Dashboard" />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 tracking-tight leading-tight">
          Welcome to your Dashboard
        </h1>
        <p className="max-w-3xl text-lg md:text-xl text-foreground/80 mb-12">
          The new unified AI Assistant is now available on the home page. Please use it for all worksheet, instant knowledge, and visual aid requests.
        </p>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Made for teachers in rural areas.</p>
      </footer>
    </div>
  );
}
