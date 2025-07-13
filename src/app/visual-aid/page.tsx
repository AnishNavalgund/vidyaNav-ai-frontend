import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export default function VisualAidPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Visual Aid Generator" />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-accent/10 rounded-full">
                        <Wrench className="h-12 w-12 text-accent" />
                    </div>
                </div>
                <CardTitle className="font-headline text-3xl">Coming Soon!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Our team is hard at work building the Visual Aid Generator. Check back soon for updates!
                </p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
