import { SwiftValidatorForm } from '@/components/swift-validator-form';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <ShieldCheck className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-headline">
            SWIFT Validator
          </h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Validate your SWIFT MT messages with confidence. Get instant feedback, error highlighting, and AI-powered suggestions to ensure your financial communications are flawless.
        </p>
      </div>
      
      <SwiftValidatorForm />
      
      <footer className="text-center mt-16 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} SWIFT Validator. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
