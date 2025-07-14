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
          Generate worksheets, visuals, and student answers — in one click.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 border-primary/20 hover:border-primary/50 hover:-translate-y-1 transform flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BookOpenCheck className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="font-headline text-2xl">Generate Smart Worksheet</CardTitle>
              <CardDescription>Create tailored math worksheets for different grade levels instantly.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="default">
                <Link href="/worksheet">
                  Start Generating <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 border-primary/20 hover:border-primary/50 hover:-translate-y-1 transform flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BrainCircuit className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="font-headline text-2xl">Instant Knowledge Assistant</CardTitle>
              <CardDescription>Get quick, clear answers to common student questions on any topic.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="default">
                <Link href="/instant-knowledge">
                  Ask AI <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 border-primary/20 hover:border-primary/50 hover:-translate-y-1 transform flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                  <Palette className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="font-headline text-2xl">Visual Aid Generator</CardTitle>
              <CardDescription>Generate engaging visual aids and learning materials.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="default">
                <Link href="/visual-aid">
                  Generate Image <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Made for teachers of India.</p>
      </footer>
    </div>
  );
}
