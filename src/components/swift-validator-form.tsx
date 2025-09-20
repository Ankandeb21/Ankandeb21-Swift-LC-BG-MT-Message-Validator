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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [state, formAction] = useActionState(validateMessageAction, initialState);
  const [message, setMessage] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (state?.status === 'valid' || state?.status === 'invalid') {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state]);

  const handleSampleClick = (type: string) => {
    if (!type) return;
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
      case '730':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I730MYBANKBBAAXXXXN}{4:
:20: ACK-REF-111
:21: OUR-REF-12345
:30: 240728
:32B: USD100000,
:71B: OUR CHARGES...
:72: WE ACKNOWLEDGE RECEIPT OF THE DOCUMENTARY CREDIT.
-}`);
        break;
      case '732':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I732MYBANKBBAAXXXXN}{4:
:20: NEG-REF-222
:21: OUR-REF-12345
:32A: 240728USD100000,
:72: WE HAVE NEGOTIATED THE DOCUMENTS AND PAID AS PER YOUR INSTRUCTIONS.
-}`);
        break;
      case '740':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I740MYBANKBBAAXXXXN}{4:
:20: AUTH-REF-333
:31D: 250131LONDON
:40B: IRREVOCABLE
:41A: REIMBURSINGBANKBIC
:42A: DRAWEEBANKBIC
:32B: USD50000,
:71B: ALL CHARGES ARE FOR...
-}`);
        break;
      case '742':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I742MYBANKBBAAXXXXN}{4:
:20: CLAIM-REF-444
:21: AUTH-REF-333
:32B: USD50000,
:33A: 240801USD50000,
:57A: BENEFICIARYBANKBIC
:72: WE CLAIM REIMBURSEMENT AS PER YOUR AUTHORIZATION.
-}`);
        break;
      case '747':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I747MYBANKBBAAXXXXN}{4:
:20: AMEND-AUTH-555
:21: AUTH-REF-333
:30: 240805
:32B: INCREASE OF USD10000,
:33B: USD60000,
:72: THE REIMBURSEMENT AUTHORIZATION IS AMENDED AS FOLLOWS.
-}`);
        break;
      case '750':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I750MYBANKBBAAXXXXN}{4:
:20: DISCREP-REF-666
:21: OUR-REF-12345
:32B: USD100000,
:77J: THE FOLLOWING DISCREPANCIES WERE FOUND:
- LATE SHIPMENT
- DOCUMENTS NOT PRESENTED WITHIN THE STIPULATED TIME.
-}`);
        break;
      case '752':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I752MYBANKBBAAXXXXN}{4:
:20: AUTH-PAY-777
:21: OUR-REF-12345
:32B: USD100000,
:72: WE AUTHORIZE YOU TO PAY/ACCEPT/NEGOTIATE THE DOCUMENTS PRESENTED UNDER THE SUBJECT CREDIT NOTWITHSTANDING THE DISCREPANCIES LISTED.
-}`);
        break;
      case '760':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I760MYBANKBBAAXXXXN}{4:
:27: 1/1
:20: GUARANTEE-REF-1
:30: 240801
:40C: URDG
:41A: ISSUINGBANKBIC
:45L: GUARANTEE DETAILS...
:77C: FURTHER DETAILS...
-}`);
        break;
      case '767':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I767MYBANKBBAAXXXXN}{4:
:20: AMEND-GUAR-REF-2
:21: GUARANTEE-REF-1
:30: 240802
:79: THE GUARANTEE IS AMENDED AS FOLLOWS: INCREASE OF AMOUNT TO USD200000.
-}`);
        break;
      case '768':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I768MYBANKBBAAXXXXN}{4:
:20: ACK-GUAR-REF-3
:21: AMEND-GUAR-REF-2
:72: WE ACKNOWLEDGE RECEIPT AND ACCEPTANCE OF THE AMENDMENT.
-}`);
        break;
      case '769':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:I769MYBANKBBAAXXXXN}{4:
:20: RELEASE-GUAR-REF-4
:21: GUARANTEE-REF-1
:34B: USD50000,
:72: WE ADVISE A REDUCTION IN THE GUARANTEE AMOUNT. OUR LIABILITY IS NOW USD150000.
-}`);
        break;
      case '799':
        setMessage(`{1:F01YOURCODEBB20_0000000000}{2:O799MYBANKBBAAXXXXN}{4:
:20: FREE-FORMAT-REF-5
:21: GUARANTEE-REF-1
:79: THIS IS A FREE FORMAT MESSAGE REGARDING THE GUARANTEE.
PLEASE PROVIDE US WITH THE STATUS OF THE UNDERLYING CONTRACT.
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
                <Select onValueChange={handleSampleClick}>
                  <SelectTrigger className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Load a sample message..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valid-700">MT 700 - Issue of a Documentary Credit (Valid)</SelectItem>
                    <SelectItem value="invalid-700">MT 700 - Issue of a Documentary Credit (Invalid)</SelectItem>
                    <SelectItem value="701">MT 701 - Issue of a Documentary Credit (Subsequent)</SelectItem>
                    <SelectItem value="707">MT 707 - Amendment to a Documentary Credit</SelectItem>
                    <SelectItem value="710">MT 710 - Advice of a Third Bank’s DC</SelectItem>
                    <SelectItem value="720">MT 720 - Transfer of a Documentary Credit</SelectItem>
                    <SelectItem value="730">MT 730 - Acknowledgment of LC</SelectItem>
                    <SelectItem value="732">MT 732 - Advice of Acceptance/Negotiation</SelectItem>
                    <SelectItem value="740">MT 740 - Authorization to Reimburse</SelectItem>
                    <SelectItem value="742">MT 742 - Reimbursement Claim</SelectItem>
                    <SelectItem value="747">MT 747 - Amendment to an Authorization to Reimburse</SelectItem>
                    <SelectItem value="750">MT 750 - Advice of Discrepancy</SelectItem>
                    <SelectItem value="752">MT 752 - Authorization to Pay/Accept/Negotiate</SelectItem>
                    <SelectItem value="760">MT 760 - Issue of a Guarantee</SelectItem>
                    <SelectItem value="767">MT 767 - Amendment to a Guarantee</SelectItem>
                    <SelectItem value="768">MT 768 - Acknowledgment of a Guarantee/Amendment</SelectItem>
                    <SelectItem value="769">MT 769 - Advice of Reduction or Release</SelectItem>
                    <SelectItem value="799">MT 799 - Free Format</SelectItem>
                  </SelectContent>
                </Select>
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
              <p>The {state.messageType} message is valid.</p>
            </CardContent>
          </Card>
        )}
        
        {state?.status === 'invalid' && (
          <>
            <Card className="shadow-lg border-destructive/50 border-2 animate-in fade-in-50 zoom-in-95">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <XCircle className="h-10 w-10 text-destructive" />
                <CardTitle>Validation Failed {state.messageType ? `for ${state.messageType}`: ''}</CardTitle>
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
