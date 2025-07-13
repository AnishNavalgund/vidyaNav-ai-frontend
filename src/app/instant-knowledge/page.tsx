import { Header } from '@/components/Header';
import { InstantKnowledgeForm } from './InstantKnowledgeForm';

export default function InstantKnowledgePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Ask a Student Question" />
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Instant Knowledge</h2>
            <p className="text-muted-foreground mt-2">
              Have a question a student asked? Get a clear, easy-to-understand answer in seconds.
            </p>
          </div>
          <InstantKnowledgeForm />
        </div>
      </main>
    </div>
  );
}
