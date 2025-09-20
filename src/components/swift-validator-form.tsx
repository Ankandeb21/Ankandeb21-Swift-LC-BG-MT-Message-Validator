'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Rocket,
  XCircle,
} from 'lucide-react';

import { validateMessageAction, type ValidationResult } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const initialState: ValidationResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" aria-disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Validating...
        </>
      ) : (
        <>
          <Rocket className="mr-2 h-4 w-4" />
          Validate Message
        </>
      )}
    </Button>
  );
}

export function SwiftValidatorForm() {
  const [state, formAction] = useFormState(validateMessageAction, initialState);
  const [message, setMessage] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (state?.status === 'valid' || state?.status === 'invalid') {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state]);

  const handleSampleClick = (type: string) => {
    switch (type) {
      case 'valid-700':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I700MYBANKBBAAXXXXN}{4:
:27: 1/1
:40A: IRREVOCABLE
:20: OUR-REF-12345
:31C: 240725
:31D: 241231LONDON
:50:
APPLICANT NAME
APPLICANT ADDRESS
:59:
BENEFICIARY NAME
BENEFICIARY ADDRESS
:32B: USD100000,00
:41D: ANY BANK
BY NEGOTIATION
:49: CONFIRM
:71B: ALL CHARGES OUTSIDE OF ISSUING
BANK ARE FOR ACCOUNT OF BENEFICIARY
-}`);
        break;
      case 'invalid-700':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I700MYBANKBBAAXXXXN}{4:
:40A: IREVOCABLE
:20:
:31D: 241231
:50:
APPLICANT NAME
APPLICANT ADDRESS
:32B: US100000
:41D: ANY BANK
BY NEGOTIATION
-}`);
        break;
      case '701':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I701MYBANKBBAAXXXXN}{3:{108:MT700 12345}}{4:
:27: 2/2
:45B: DESCRIPTION OF GOODS & SERVICES
FURTHER DESCRIPTION OF GOODS CONTINUED
:46B: DOCUMENTS REQUIRED
FURTHER DOCUMENTS REQUIRED CONTINUED
:47B: ADDITIONAL CONDITIONS
FURTHER ADDITIONAL CONDITIONS CONTINUED
-}`);
        break;
      case '707':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I707MYBANKBBAAXXXXN}{4:
:20: AMEND-REF-67890
:21: OUR-REF-12345
:31C: 240726
:30: 240726
:26E: 001/LATEST SHIP DATE
:59:
BENEFICIARY NAME
BENEFICIARY ADDRESS
:32B: USD105000,
:34B: USD5000,
:79: NARRATIVE OF AMENDMENT...
-}`);
        break;
      case '710':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I710MYBANKBBAAXXXXN}{4:
:20: THEIR-REF-54321
:21: OUR-REF-12345
:31C: 240725
:31D: 241231LONDON
:50:
APPLICANT NAME
:59:
BENEFICIARY NAME
:32B: USD100000,
:72: ADVISING BANK'S CHARGES...
-}`);
        break;
      case '720':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I720MYBANKBBAAXXXXN}{4:
:20: TRANSFER-REF-98765
:21: ORIGINAL-LC-REF-12345
:31D: 241230NEWYORK
:52A: ISSUING BANK OF ORIGINAL LC
:59:
SECOND BENEFICIARY NAME
ADDRESS
:32B: USD50000,
:40F: APPLICABLE RULES...
:72: REIMBURSEMENT INSTRUCTIONS...
-}`);
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      <div className="flex flex-col gap-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>SWIFT Message Input</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <Textarea
                name="message"
                placeholder="Paste your SWIFT MT message here..."
                className="min-h-[400px] font-mono text-sm bg-card"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <SubmitButton />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                <Button type="button" variant="outline" onClick={() => handleSampleClick('valid-700')}>Load MT700 (Valid)</Button>
                <Button type="button" variant="outline" onClick={() => handleSampleClick('invalid-700')}>Load MT700 (Invalid)</Button>
                <Button type="button" variant="outline" onClick={() => handleSampleClick('701')}>Load MT701</Button>
                <Button type="button" variant="outline" onClick={() => handleSampleClick('707')}>Load MT707</Button>
                <Button type="button" variant="outline" onClick={() => handleSampleClick('710')}>Load MT710</Button>
                <Button type="button" variant="outline" onClick={() => handleSampleClick('720')}>Load MT720</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div ref={resultsRef} className="space-y-8 lg:min-h-[570px]">
        {state?.status === 'valid' && (
          <Card className="shadow-lg border-green-500 border-2 animate-in fade-in-50 zoom-in-95">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <CardTitle>Validation Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The SWIFT message is valid.</p>
            </CardContent>
          </Card>
        )}
        
        {state?.status === 'invalid' && (
          <>
            <Card className="shadow-lg border-destructive/50 border-2 animate-in fade-in-50 zoom-in-95">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <XCircle className="h-10 w-10 text-destructive" />
                <CardTitle>Validation Failed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                 <p>{state.errors.length} error(s) found in the message.</p>
                 {state.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{error.field}</AlertTitle>
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                ))}
              </CardContent>
            </Card>

            {state.suggestions && state.suggestions.length > 0 && (
              <Card className="shadow-lg border-primary/50 border-2 animate-in fade-in-50 zoom-in-95" style={{ animationDelay: '150ms' }}>
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Lightbulb className="h-10 w-10 text-primary" />
                    <CardTitle>AI-Powered Fix Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {state.suggestions?.map((suggestion, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>Suggestion #{index + 1}</AccordionTrigger>
                        <AccordionContent className="prose prose-sm max-w-none">
                          <p>{suggestion}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
