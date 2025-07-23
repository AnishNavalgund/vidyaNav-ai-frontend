"use client";
import { useState, useTransition } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ImageIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VisualAidResult {
  image_url: string;
  caption: string;
  topic: string;
}

export default function VisualAidPage() {
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<VisualAidResult[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);
    startTransition(async () => {
      try {
        const res = await fetch('http://localhost:8080/visual-aid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, count }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || 'Failed to generate visual aid');
        }
        const data = await res.json();
        // If backend returns a single object, wrap in array
        setResults(Array.isArray(data) ? data : [data]);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleGenerateAgain = () => {
    setResults(null);
    setError(null);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Visual Aid Generator" />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">Visual Aid Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="prompt" className="block font-medium">What should the AI draw?</label>
                <Input
                  id="prompt"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. A tree with roots and branches"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="count" className="block font-medium">How many images?</label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={5}
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  required
                  disabled={isPending}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><ImageIcon className="mr-2 h-4 w-4" /> Generate Image</>
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-4 text-red-600 text-center font-medium">{error}</div>
            )}

            {results && (
              <div className="flex flex-col items-center mt-8 w-full">
                <div className={`grid gap-6 w-full ${results.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                  {results.map((result, idx) => (
                    <Card key={idx} className="w-full shadow-md rounded-xl p-4 flex flex-col items-center">
                      <img
                        src={result.image_url}
                        alt={result.caption || 'AI generated visual aid'}
                        className="rounded-lg shadow mb-4 max-h-80 object-contain bg-white"
                        style={{ width: '100%', maxWidth: 400 }}
                      />
                      <div className="text-lg font-semibold text-primary mb-1">{result.topic}</div>
                      <div className="text-muted-foreground mb-2 text-center">{result.caption}</div>
                    </Card>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-6" onClick={handleGenerateAgain}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Generate Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
