'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Rocket,
  Shuffle,
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

const validSamples = [
  `{1:F01YOURCODEBB20_0000000000}{2:I700MYBANKBBAAXXXXN}{4:
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
-}`,
  `{1:F01YOURCODEBB20_0000000000}{2:I701MYBANKBBAAXXXXN}{3:{108:MT700 12345}}{4:
:27: 2/2
:45B: DESCRIPTION OF GOODS & SERVICES
FURTHER DESCRIPTION OF GOODS CONTINUED
:46B: DOCUMENTS REQUIRED
FURTHER DOCUMENTS REQUIRED CONTINUED
:47B: ADDITIONAL CONDITIONS
FURTHER ADDITIONAL CONDITIONS CONTINUED
-}`,
  `{1:F01YOURCODEBB20_0000000000}{2:I707MYBANKBBAAXXXXN}{4:
:20: AMEND-REF-67890
:21: OUR-REF-12345
:31C: 240726
:30: 240726
:26E: 001/LATEST SHIP DATE
:59:
BENEFICIARY NAME
BENEFICIARY ADDRESS
:32B: USD105000,00
:34B: USD5000,00
:79: NARRATIVE OF AMENDMENT...
-}`,
  `{1:F01YOURCODEBB20_0000000000}{2:I710MYBANKBBAAXXXXN}{4:
:20: THEIR-REF-54321
:21: OUR-REF-12345
:31C: 240725
:31D: 241231LONDON
:50:
APPLICANT NAME
:59:
BENEFICIARY NAME
:32B: USD100000,00
:72: ADVISING BANK'S CHARGES...
-}`,
  `{1:F01YOURCODEBB20_0000000000}{2:I730MYBANKBBAAXXXXN}{4:
:20: ACK-REF-111
:21: OUR-REF-12345
:30: 240728
:32B: USD100000,00
:71B: OUR CHARGES...
:72: WE ACKNOWLEDGE RECEIPT OF THE DOCUMENTARY CREDIT.
-}`,
  `{1:F01YOURCODEBB20_0000000000}{2:I740MYBANKBBAAXXXXN}{4:
:20: AUTH-REF-333
:31D: 250131LONDON
:40B: IRREVOCABLE
:41A: REIMBURSINGBANKBIC
:42A: DRAWEEBANKBIC
:32B: USD50000,00
:71B: ALL CHARGES ARE FOR...
-}`,
  `{1:F01YOURCODEBB20_0000000000}{2:I760MYBANKBBAAXXXXN}{4:
:27: 1/1
:20: GUARANTEE-REF-1
:30: 240801
:40C: URDG
:41A: ISSUINGBANKBIC
:45L: GUARANTEE DETAILS...
:77C: FURTHER DETAILS...
-}`,
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full sm:w-auto" aria-disabled={pending}>
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
  const [state, formAction] = useActionState(validateMessageAction, initialState);
  const [message, setMessage] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (state?.status === 'valid' || state?.status === 'invalid') {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state]);

  const handleRandomSampleClick = () => {
    const randomIndex = Math.floor(Math.random() * validSamples.length);
    setMessage(validSamples[randomIndex]);
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
                className="min-h-[400px] font-mono text-sm bg-background/50 focus-visible:ring-primary border-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <SubmitButton />
                <Button type="button" variant="outline" onClick={handleRandomSampleClick}>
                  <Shuffle className="mr-2" />
                  Load Random Valid Sample
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div ref={resultsRef} className="space-y-8 lg:min-h-[570px]">
        {state?.status === 'valid' && (
          <Card className="border-accent/50 bg-accent/10 animate-in fade-in-50 zoom-in-95 shadow-lg">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <CheckCircle2 className="h-10 w-10 text-accent" />
              <CardTitle>Validation Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-accent-foreground/80'>The {state.messageType} message is valid.</p>
            </CardContent>
          </Card>
        )}
        
        {state?.status === 'invalid' && (
          <>
            <Card className="border-destructive/50 bg-destructive/10 animate-in fade-in-50 zoom-in-95 shadow-lg">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <XCircle className="h-10 w-10 text-destructive" />
                <CardTitle>Validation Failed {state.messageType ? `for ${state.messageType}`: ''}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                 <p className='text-destructive/90'>{state.errors.length} error(s) found in the message.</p>
                 {state.errors.map((error, index) => (
                    <Alert key={index} variant="destructive" className='bg-destructive/10'>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{error.field}</AlertTitle>
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                ))}
              </CardContent>
            </Card>

            {state.suggestions && state.suggestions.length > 0 && (
              <Card className="border-primary/30 bg-primary/5 animate-in fade-in-50 zoom-in-95 shadow-lg" style={{ animationDelay: '150ms' }}>
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Lightbulb className="h-10 w-10 text-primary" />
                    <CardTitle>AI-Powered Fix Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {state.suggestions?.map((suggestion, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>Suggestion #{index + 1}</AccordionTrigger>
                        <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
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
