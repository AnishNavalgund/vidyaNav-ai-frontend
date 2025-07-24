import { Header } from '@/components/Header';

export default function WorksheetPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Smart Worksheet Generator" />
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Smart Worksheet Generator</h2>
            <p className="text-muted-foreground mt-2">
              This feature is now part of the unified AI Assistant on the home page.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
