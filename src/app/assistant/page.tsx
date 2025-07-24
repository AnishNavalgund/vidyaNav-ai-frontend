'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, BookOpenCheck, Palette, BrainCircuit, HelpCircle, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Helper to get full image URL
function getImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Optionally, fallback for legacy/local dev:
  return `http://localhost:8080/${url.replace(/^\/+/, '')}`;
}

function RenderResult({ result }: { result: any }) {
  if (!result) return null;

  // If result is an array of images (visual aid), render as visual aid
  if (Array.isArray(result) && result.length > 0 && result[0].image_url) {
    const images = result;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-primary"><Palette className="h-5 w-5" /> <span className="font-bold text-lg">Visual Aid</span></div>
        <div className="grid gap-6 sm:grid-cols-2">
          {images.map((img: any, idx: number) => (
            <Card key={idx} className="flex flex-col items-center p-4">
              <img src={getImageUrl(img.image_url)} alt={img.caption} className="rounded-lg shadow mb-2 max-h-64 object-contain bg-white" style={{ width: '100%', maxWidth: 400 }} />
              <div className="text-lg font-semibold text-primary mb-1">{img.topic}</div>
              <div className="text-muted-foreground mb-2 text-center text-sm">{img.caption}</div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Worksheet rendering: grade_X keys with string values
  const gradeKeys = Object.keys(result).filter(k => /^grade_\d+$/.test(k) && typeof result[k] === 'string' && result[k]);
  if (gradeKeys.length > 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <BookOpenCheck className="h-6 w-6" />
          <span className="font-extrabold text-2xl">Generated Worksheet</span>
        </div>
        <div className="grid grid-cols-1 gap-12 w-full max-w-4xl mx-auto">
          {gradeKeys.map((gradeKey, idx) => (
            <Card key={gradeKey} className="p-0 shadow-lg border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-white">
              <div className="flex items-center px-8 py-6 rounded-t-lg bg-primary/90 mb-0">
                <BookOpenCheck className="h-7 w-7 text-white mr-3" />
                <span className="font-extrabold text-white text-2xl tracking-wide">Grade {gradeKey.replace('grade_', '')} Worksheet</span>
              </div>
              <div className="prose max-w-none text-foreground bg-white/90 rounded-b-lg px-10 py-8 text-lg leading-relaxed space-y-6">
                <ReactMarkdown>{result[gradeKey]}</ReactMarkdown>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Try to detect intent
  const intent = result.intent || result.type || (result.worksheets || result.grade_1 || result.grade_2) || (result.answer && 'instant_knowledge') || (result.image_url || result.images || result.visuals ? 'visual_aid' : null);

  // Worksheet rendering
  if (intent === 'worksheet' && (result.worksheets || result.grade_1 || result.grade_2)) {
    const worksheets = result.worksheets || Object.keys(result).filter(k => k.startsWith('grade_')).map(k => ({ gradeLevel: k.replace('grade_', ''), problems: result[k] }));
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-primary"><BookOpenCheck className="h-5 w-5" /> <span className="font-bold text-lg">Generated Worksheet</span></div>
        {Array.isArray(worksheets) && worksheets.length > 0 ? (
          <div className="space-y-6">
            {worksheets.map((ws: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-primary">Grade {ws.gradeLevel}</span>
                </div>
                <ol className="list-decimal pl-6 space-y-2">
                  {ws.problems?.map((prob: string, i: number) => (
                    <li key={i} className="text-base text-foreground">{prob}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ) : <div>No worksheet data found.</div>}
      </div>
    );
  }

  // Instant Knowledge rendering
  if (intent === 'instant_knowledge' && result.answer) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-primary"><BrainCircuit className="h-5 w-5" /> <span className="font-bold text-lg">AI Answer</span></div>
        <div className="prose prose-lg max-w-none bg-muted/50 rounded-lg p-4 border border-border mb-2">
          <p>{result.answer}</p>
        </div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
          {result.analogy_used !== undefined && <span>Analogy used: <b>{result.analogy_used ? 'Yes' : 'No'}</b></span>}
          {result.confidence_score && <span>Confidence: <b>{(result.confidence_score * 100).toFixed(1)}%</b></span>}
          {result.model_used && <span>Model: <b>{result.model_used}</b></span>}
        </div>
        {result.source_chunks && Array.isArray(result.source_chunks) && result.source_chunks.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-primary underline">Show supporting textbook excerpts</summary>
            <ul className="list-disc pl-6 mt-2 text-sm text-muted-foreground">
              {result.source_chunks.map((chunk: string, i: number) => <li key={i}>{chunk}</li>)}
            </ul>
          </details>
        )}
      </div>
    );
  }

  // Fallback: show JSON
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 text-primary"><HelpCircle className="h-5 w-5" /> <span className="font-bold text-lg">Raw Result</span></div>
      <pre className="whitespace-pre-wrap break-words text-sm bg-muted/50 rounded-lg p-4 border border-border">{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}

export default function AssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (file) formData.append('file', file);
      const res = await fetch('http://localhost:8080/ai-assistant/', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to get response');
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        {/* Highlights Section */}
        <div className="w-full max-w-3xl mb-10 bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-sm">
          <h2 className="text-4xl font-extrabold font-headline mb-2 text-primary flex items-center gap-2">
            <span>✨</span> What can VidyaNav-ai do for you?
          </h2>
          <p className="text-lg text-muted-foreground mb-6">Empowering teachers with instant, AI-powered tools for every classroom moment. Just type your need or upload a file—VidyaNav-ai figures out the rest!</p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-xl p-5 border border-border flex flex-col items-center shadow hover:shadow-md transition-shadow">
              <BookOpenCheck className="h-9 w-9 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-1 text-primary">Smart Worksheet Generator</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-4 text-left space-y-1">
                <li>Upload a textbook page or image</li>
                <li>Get printable, grade-specific worksheets</li>
                <li>Supports multiple languages</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-5 border border-border flex flex-col items-center shadow hover:shadow-md transition-shadow">
              <Palette className="h-9 w-9 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-1 text-primary">Visual Aid Generator</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-4 text-left space-y-1">
                <li>Describe any concept or topic</li>
                <li>AI creates clear, engaging images</li>
                <li>Perfect for classroom explanations</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-5 border border-border flex flex-col items-center shadow hover:shadow-md transition-shadow">
              <BrainCircuit className="h-9 w-9 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-1 text-primary">Instant Knowledge Service</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-4 text-left space-y-1">
                <li>Ask any question from your textbook</li>
                <li>Get simple, accurate answers</li>
                <li>Tailored to your students' grade & language</li>
              </ul>
            </div>
          </div>
        </div>
        {/* AI Assistant Form */}
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="prompt" className="block font-medium">What do you need help with?</label>
                <Input
                  id="prompt"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Type your request (e.g. Generate a worksheet for grade 5 in German, or Draw a tree, or Answer: Why is the sky blue?)"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="file" className="block font-medium">Upload textbook image, PDF, or DOCX (optional)</label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,.pdf,.docx"
                    ref={fileInputRef}
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    disabled={isPending}
                  />
                  {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={isPending || !file}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <>Ask AI</>
                )}
              </Button>
            </form>
            {error && (
              <div className="mt-4 text-red-600 text-center font-medium">{error}</div>
            )}
            {result && (
              <div className="mt-8 text-left">
                <RenderResult result={result} />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 