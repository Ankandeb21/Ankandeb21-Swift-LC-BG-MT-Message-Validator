import { SwiftValidatorForm } from '@/components/swift-validator-form';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-headline">
          SWIFT Validator
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Validate your SWIFT MT messages with confidence. Get instant feedback, error highlighting, and AI-powered suggestions to ensure your financial communications are flawless.
        </p>
      </div>
      
      <SwiftValidatorForm />
      
      <footer className="text-center mt-16 text-muted-foreground text-sm">
        <p>Powered by GenAI. For demonstration purposes only.</p>
        <p>&copy; {new Date().getFullYear()} SWIFT Validator. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
