import { SwiftValidatorForm } from './components/swift-validator-form';
import { ShieldCheck } from 'lucide-react';
import { Toaster } from './components/ui/toaster';


function App() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-8">
            <ShieldCheck className="h-20 w-20 text-primary" style={{ width: '6rem', height: '6rem' }} />
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-foreground" style={{ fontSize: '4rem' }}>
              SWIFT LC/BG Validator
            </h1>
          </div>
          <div className="flex justify-center">
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-center leading-relaxed">
              Validate your Letter of Credit and Bank Guarantee messages with confidence. Get instant feedback, error highlighting, and intelligent suggestions to ensure your trade finance communications are flawless.
            </p>
          </div>
        </div>
        
        <SwiftValidatorForm />
        
        <footer className="text-center mt-16 text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} SWIFT LC/BG Validator. All Rights Reserved.</p>
        </footer>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
