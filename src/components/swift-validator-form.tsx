'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageSquarePlus,
  Rocket,
  XCircle,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialState: ValidationResult | null = null;

const sampleMessages = [
  {
    name: 'MT 700 - Issue of a Documentary Credit',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I700MYBANKBBAAXXXXN}{4:
:27: 1/1
:40A: IRREVOCABLE
:20: OUR-REF-12345
:31C: 240725
:31D: 241231LONDON
:50: APPLICANT NAME
APPLICANT ADDRESS
:59: BENEFICIARY NAME
BENEFICIARY ADDRESS
:32B: USD100000,00
:41D: ANY BANK
BY NEGOTIATION
:49: CONFIRM
:71B: ALL CHARGES OUTSIDE...
-}`
  },
  {
    name: 'MT 700 - Issue of a Documentary Credit (Invalid)',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I700MYBANKBBAAXXXXN}{4:
:27: 1 OF 1
:40A: IRRECOVABLE
:20: OUR-REF-12345-TOO-LONG-REFERENCE
:31C: 20240725
:31D: 241231
:50:
APPLICANT NAME
:32B: 100000,00
:41D: ANY BANK
:49: MAYBE
-}`
  },
  {
    name: 'MT 701 - Issue of a Documentary Credit (Second & Subsequent Pages)',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I701MYBANKBBAAXXXXN}{3:{108:MT700 12345}}{4:
:27: 2/2
:45B: DESCRIPTION OF GOODS & SERVICES
FURTHER DESCRIPTION OF GOODS CONTINUED
:46B: DOCUMENTS REQUIRED
FURTHER DOCUMENTS REQUIRED CONTINUED
:47B: ADDITIONAL CONDITIONS
FURTHER ADDITIONAL CONDITIONS CONTINUED
-}`
  },
  {
    name: 'MT 707 - Amendment to a Documentary Credit',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I707MYBANKBBAAXXXXN}{4:
:20: AMEND-REF-67890
:21: OUR-REF-12345
:31C: 240726
:30: 240726
:26E: 001/LATEST SHIP DATE
:59: BENEFICIARY NAME
BENEFICIARY ADDRESS
:32B: USD105000,00
:34B: USD5000,00
:79: NARRATIVE OF AMENDMENT...
-}`
  },
  {
    name: 'MT 710 - Advice of a Third Bank’s Documentary Credit',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I710MYBANKBBAAXXXXN}{4:
:20: THEIR-REF-54321
:21: OUR-REF-12345
:31C: 240725
:31D: 241231LONDON
:50: APPLICANT NAME
:59: BENEFICIARY NAME
:32B: USD100000,00
:72: ADVISING BANK'S CHARGES...
-}`
  },
    {
    name: 'MT 720 - Transfer of a Documentary Credit',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I720MYBANKBBAAXXXXN}{4:
:20: TRANSFER-REF-001
:21: ORIGINAL-DC-REF
:31C: 240801
:40F: APPLICABLE RULES/UCP LATEST VERSION
:32B: USD50000,00
:59: NEW BENEFICIARY (TRANSFEREE)
ADDRESS
:72: REIMBURSING BANK'S CHARGES...
-}`
  },
  {
    name: 'MT 730 - Acknowledgment of LC',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I730MYBANKBBAAXXXXN}{4:
:20: ACK-REF-111
:21: OUR-REF-12345
:30: 240728
:32B: USD100000,00
:71B: OUR CHARGES...
:72: WE ACKNOWLEDGE RECEIPT OF THE DOCUMENTARY CREDIT.
-}`
  },
    {
    name: 'MT 732 - Advice of Acceptance/Negotiation',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I732MYBANKBBAAXXXXN}{4:
:20: ADVICE-REF-001
:21: YOUR-REF-123
:32A: 240805USD12345,67
:53A: PAYINGBANKBIC
:72: WE HAVE NEGOTIATED COMPLYING PRESENTATION.
-}`
  },
  {
    name: 'MT 740 - Authorization to Reimburse',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I740MYBANKBBAAXXXXN}{4:
:20: AUTH-REF-333
:31D: 250131LONDON
:40B: IRREVOCABLE
:41A: REIMBURSINGBANKBIC
:42A: DRAWEEBANKBIC
:32B: USD50000,00
:71B: ALL CHARGES ARE FOR...
-}`
  },
    {
    name: 'MT 742 - Reimbursement Claim',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I742REIMBANKBBAAXXXXN}{4:
:20: CLAIM-REF-456
:21: DC-NUMBER
:32B: USD25000,00
:53A: ISSUINGBANKBIC
:71B: OUR CHARGES...
-}`
  },
  {
    name: 'MT 747 - Amendment to an Authorization to Reimburse',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I747MYBANKBBAAXXXXN}{4:
:20: AMEND-AUTH-REF-002
:21: ORIGINAL-AUTH-REF
:30: 240810
:33B: USD55000,00
:72: DETAILS OF AMENDMENT...
-}`
  },
  {
    name: 'MT 750 - Advice of Discrepancy',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I750MYBANKBBAAXXXXN}{4:
:20: DISCREPANCY-REF-001
:21: DC-NUMBER
:32B: USD100000,00
:77J: DESCRIPTION OF DISCREPANCIES...
-}`
  },
  {
    name: 'MT 752 - Authorization to Pay/Accept/Negotiate',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I752MYBANKBBAAXXXXN}{4:
:20: AUTH-PAY-REF-001
:21: DC-NUMBER
:32B: USD100000,00
:53A: PAYINGBANKBIC
:72: WE AUTHORIZE YOU TO PAY/ACCEPT/NEGOTIATE...
-}`
  },
  {
    name: 'MT 760 - Issue of a Guarantee',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I760MYBANKBBAAXXXXN}{4:
:27: 1/1
:22A: NEW
:20: GUARANTEE-REF-001
:30: 240815
:40C: URDG LATEST VERSION
:22D: ADVI
:52A: ADVISINGBANKBIC
:59: BENEFICIARY NAME
ADDRESS
:77C: DETAILS OF GUARANTEE...
-}`
  },
  {
    name: 'MT 767 - Amendment to a Guarantee',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I767MYBANKBBAAXXXXN}{4:
:20: AMEND-GUAR-REF-01
:21: GUARANTEE-REF-001
:30: 240820
:23: AMENDMENT DETAILS...
:77C: FURTHER DETAILS...
-}`
  },
  {
    name: 'MT 768 - Acknowledgment of a Guarantee/Amendment',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I768MYBANKBBAAXXXXN}{4:
:20: ACK-GUAR-REF-001
:21: GUARANTEE-REF-001
:30: 240821
:77C: WE ACKNOWLEDGE RECEIPT OF THE GUARANTEE/AMENDMENT.
-}`
  },
  {
    name: 'MT 769 - Advice of Reduction or Release of a Guarantee',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I769MYBANKBBAAXXXXN}{4:
:20: REDUCE-REL-REF-01
:21: GUARANTEE-REF-001
:30: 240822
:39C: REDUCED AMOUNT/DETAILS OF RELEASE
:77C: FURTHER DETAILS...
-}`
  },
  {
    name: 'MT 799 - Free Format',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I799MYBANKBBAAXXXXN}{4:
:20: TRANSACTION-REF-01
:21: RELATED-REF-02
:79: THIS IS A FREE FORMAT MESSAGE.
USED FOR COMMUNICATION BETWEEN BANKS.
OFTEN RELATED TO GUARANTEES OR OTHER TRANSACTIONS.
-}`
  }
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

  const handleSampleSelect = (sampleMessage: string) => {
    setMessage(sampleMessage);
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto justify-between">
                      <div className="flex items-center">
                        <MessageSquarePlus className="mr-2" />
                        Load a sample message
                      </div>
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-[--radix-dropdown-menu-trigger-width]'>
                    <ScrollArea className="h-72">
                      {sampleMessages.map((sample) => (
                        <DropdownMenuItem
                          key={sample.name}
                          onSelect={() => handleSampleSelect(sample.message)}
                        >
                          {sample.name}
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
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
