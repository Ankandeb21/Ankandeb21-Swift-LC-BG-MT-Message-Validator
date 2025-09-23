'use client';

import { useState, useRef, useEffect } from 'react';
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
import { format } from 'date-fns';

import { validateSwiftMessage, type ValidationError, getSwiftMessageType } from '@/lib/swift-validator';
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

interface ValidationResult {
  status: 'valid' | 'invalid' | 'error';
  messageType?: string | null;
  errors?: ValidationError[];
  suggestions?: string[];
  message?: string;
}

const sampleMessages = [
  {
    name: 'MT 700 - Issue of a Documentary Credit',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I700MYBANKBBAAXXXXN}{4:
:27: 1/1
:40A: IRREVOCABLE
:20: DC-{RANDOM_REF_SHORT}
:31C: {DATE_YYMMDD}
:40E: UCP LATEST VERSION
:31D: {DATE_YYMMDD_PLUS_6M} LONDON
:50:
APPLICANT NAME
APPLICANT ADDRESS
:59:
BENEFICIARY NAME
BENEFICIARY ADDRESS
:32B: USD{RANDOM_AMOUNT}
:41D: ANY BANK
BY NEGOTIATION
:43P: ALLOWED
:43T: ALLOWED
:44C: {DATE_YYMMDD_PLUS_3M}
:45A:
+ GOODS
:46A:
+ DOCUMENTS
:47A:
+ CONDITIONS
:49: CONFIRM
:53A: {RANDOM_BIC}
:71B:
CHARGES
:78:
INSTRUCTIONS TO PAYING/ACCEPTING/NEGOTIATING BANK
-}`
  },
  {
    name: 'MT 701 - Issue of a Documentary Credit (Cont.)',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I701MYBANKBBAAXXXXN}{3:{108:MT700{RANDOM_REF_SHORT}}}{4:
:27: 2/2
:20: DC-{RANDOM_REF_SHORT}
:21: {PREV_MSG_REF}
:45B:
DESCRIPTION OF GOODS AND SERVICES
FURTHER DESCRIPTION OF GOODS CONTINUED
-}`
  },
  {
    name: 'MT 707 - Amendment to a Documentary Credit',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I707MYBANKBBAAXXXXN}{4:
:20: AMEND-{RANDOM_REF_SHORT}
:21: OUR-REF-{RANDOM_REF_SHORT}
:31C: {DATE_YYMMDD}
:30: {DATE_YYMMDD}
:26E: 001/LATEST SHIP DATE
:59:
BENEFICIARY NAME
BENEFICIARY ADDRESS
:32B: USD{RANDOM_AMOUNT}
:34B: USD{RANDOM_AMOUNT_SMALL}
:79:
NARRATIVE OF AMENDMENT...
-}`
  },
  {
    name: "MT 710 - Advice of a Third Bank's DC",
    message: `{1:F01YOURCODEBB20_0000000000}{2:I710MYBANKBBAAXXXXN}{4:
:20: THEIR-{RANDOM_REF_SHORT}
:21: OUR-REF-{RANDOM_REF_SHORT}
:31C: {DATE_YYMMDD}
:31D: {DATE_YYMMDD_PLUS_6M} LONDON
:50:
APPLICANT NAME
APPLICANT ADDRESS
:59:
BENEFICIARY NAME
BENEFICIARY ADDRESS
:32B: USD{RANDOM_AMOUNT}
:72:
ADVISING BANK'S CHARGES...
-}`
  },
    {
    name: 'MT 720 - Transfer of a Documentary Credit',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I720MYBANKBBAAXXXXN}{4:
:20: TR-REF-{RANDOM_REF_SHORT}
:21: {DC_NUMBER}
:31C: {DATE_YYMMDD}
:40F: UCP LATEST VERSION
:32B: USD{RANDOM_AMOUNT}
:59:
NEW BENEFICIARY (TRANSFEREE)
ADDRESS
:72:
REIMBURSING BANK'S CHARGES...
-}`
  },
  {
    name: 'MT 730 - Acknowledgment of LC',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I730MYBANKBBAAXXXXN}{4:
:20: ACK-REF-{RANDOM_REF_SHORT}
:21: OUR-REF-{RANDOM_REF_SHORT}
:30: {DATE_YYMMDD}
:32B: USD{RANDOM_AMOUNT}
:71B:
OUR CHARGES...
:72:
WE ACKNOWLEDGE RECEIPT OF THE DOCUMENTARY CREDIT.
-}`
  },
    {
    name: 'MT 732 - Advice of Discharge',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I732MYBANKBBAAXXXXN}{4:
:20: ADVICE-{RANDOM_REF_SHORT}
:21: YOUR-REF-123
:32A: {DATE_YYMMDD}USD{RANDOM_AMOUNT_SMALL}
:53A: {RANDOM_BIC}
:72:
WE HAVE NEGOTIATED COMPLYING PRESENTATION.
-}`
  },
  {
    name: 'MT 740 - Authorization to Reimburse',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I740MYBANKBBAAXXXXN}{4:
:20: AUTH-{RANDOM_REF_SHORT}
:31D: {DATE_YYMMDD_PLUS_1Y} LONDON
:40B: IRREVOCABLE
:41A: {RANDOM_BIC}
:42A: {RANDOM_BIC}
:32B: USD{RANDOM_AMOUNT}
:71B:
ALL CHARGES ARE FOR...
-}`
  },
    {
    name: 'MT 742 - Reimbursement Claim',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I742REIMBANKBBAAXXXXN}{4:
:20: CLAIM-{RANDOM_REF_SHORT}
:21: {DC_NUMBER}
:32B: USD{RANDOM_AMOUNT_SMALL}
:53A: {RANDOM_BIC}
:71B:
OUR CHARGES...
-}`
  },
  {
    name: 'MT 747 - Amendment to an Auth to Reimburse',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I747MYBANKBBAAXXXXN}{4:
:20: AM-AUTH-{RANDOM_REF_SHORT}
:21: {ORIGINAL_AUTH_REF}
:30: {DATE_YYMMDD}
:33B: USD{RANDOM_AMOUNT}
:72:
DETAILS OF AMENDMENT...
-}`
  },
  {
    name: 'MT 750 - Advice of Discrepancy',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I750MYBANKBBAAXXXXN}{4:
:20: DIS-REF-{RANDOM_REF_SHORT}
:21: {DC_NUMBER}
:32B: USD{RANDOM_AMOUNT}
:77J:
DESCRIPTION OF DISCREPANCIES...
-}`
  },
  {
    name: 'MT 752 - Auth to Pay/Accept/Negotiate',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I752MYBANKBBAAXXXXN}{4:
:20: AUTH-PAY-{RANDOM_REF_SHORT}
:21: {DC_NUMBER}
:32B: USD{RANDOM_AMOUNT}
:53A: {RANDOM_BIC}
:72:
WE AUTHORIZE YOU TO PAY/ACCEPT/NEGOTIATE...
-}`
  },
  {
    name: 'MT 760 - Issue of a Guarantee',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I760MYBANKBBAAXXXXN}{4:
:27: 1/1
:22A: ISSUE
:20: GUAR-{RANDOM_REF_SHORT}
:30: {DATE_YYMMDD}
:40C: URDG LATEST VERSION
:22D: ADVI
:52A: {RANDOM_BIC}
:59:
BENEFICIARY NAME
ADDRESS
:77C:
DETAILS OF GUARANTEE...
-}`
  },
  {
    name: 'MT 767 - Amendment to a Guarantee',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I767MYBANKBBAAXXXXN}{4:
:20: AM-GUAR-{RANDOM_REF_SHORT}
:21: GUAR-{RANDOM_REF_SHORT}
:30: {DATE_YYMMDD}
:23: AMENDMENT DETAILS...
:77C:
FURTHER DETAILS...
-}`
  },
  {
    name: 'MT 768 - Acknowledgment of a Guarantee',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I768MYBANKBBAAXXXXN}{4:
:20: ACK-GUAR-{RANDOM_REF_SHORT}
:21: GUAR-{RANDOM_REF_SHORT}
:30: {DATE_YYMMDD}
:77C:
WE ACKNOWLEDGE RECEIPT OF THE GUARANTEE/AMENDMENT.
-}`
  },
  {
    name: 'MT 769 - Advice of Reduction or Release',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I769MYBANKBBAAXXXXN}{4:
:20: RD-RL-{RANDOM_REF_SHORT}
:21: GUAR-{RANDOM_REF_SHORT}
:30: {DATE_YYMMDD}
:39C:
DETAILS OF THE REDUCTION.
:77C:
FURTHER DETAILS...
-}`
  },
  {
    name: 'MT 799 - Free Format',
    message: `{1:F01YOURCODEBB20_0000000000}{2:I799MYBANKBBAAXXXXN}{4:
:20: TXN-{RANDOM_REF_SHORT}
:21: RELATED-{RANDOM_REF_SHORT}
:79:
THIS IS A FREE FORMAT MESSAGE.
USED FOR COMMUNICATION BETWEEN BANKS.
OFTEN RELATED TO GUARANTEES OR OTHER TRANSACTIONS.
-}`
  }
];

export function SwiftValidatorForm() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (result?.status === 'valid' || result?.status === 'invalid') {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const generateRandomMessage = (template: string) => {
    const today = new Date();
    const futureDate3m = new Date(today);
    futureDate3m.setMonth(today.getMonth() + 3);
    const futureDate6m = new Date(today);
    futureDate6m.setMonth(today.getMonth() + 6);
    const futureDate1y = new Date(today);
    futureDate1y.setFullYear(today.getFullYear() + 1);

    const randomRef = () => Math.random().toString(36).substring(2, 12).toUpperCase();
    const randomRefShort = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    const randomBic = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const country = chars.charAt(Math.floor(Math.random() * chars.length)) + chars.charAt(Math.floor(Math.random() * chars.length));
      return `TEST${country}B1XXX`;
    };

    return template
      .replace(/{RANDOM_REF}/g, randomRef())
      .replace(/{RANDOM_REF_SHORT}/g, randomRefShort())
      .replace(/{RANDOM_BIC}/g, randomBic())
      .replace(/{PREV_MSG_REF}/g, randomRef())
      .replace(/{DC_NUMBER}/g, `DC-${randomRefShort()}`)
      .replace(/{ORIGINAL_AUTH_REF}/g, `AUTH-${randomRefShort()}`)
      .replace(/{DATE_YYMMDD}/g, format(today, 'yyMMdd'))
      .replace(/{DATE_YYMMDD_PLUS_3M}/g, format(futureDate3m, 'yyMMdd'))
      .replace(/{DATE_YYMMDD_PLUS_6M}/g, format(futureDate6m, 'yyMMdd'))
      .replace(/{DATE_YYMMDD_PLUS_1Y}/g, format(futureDate1y, 'yyMMdd'))
      .replace(/{RANDOM_AMOUNT}/g, (Math.floor(Math.random() * 900000) + 100000).toFixed(2).replace('.', ','))
      .replace(/{RANDOM_AMOUNT_SMALL}/g, (Math.floor(Math.random() * 9000) + 1000).toFixed(2).replace('.', ','));
  };

  const handleSampleSelect = (sampleMessage: string) => {
    setMessage(generateRandomMessage(sampleMessage));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message || message.trim().length === 0) {
      setResult({ status: 'error', message: 'Please enter a SWIFT message to validate.' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const messageType = getSwiftMessageType(message);
      const validationErrors = validateSwiftMessage(message);

      if (validationErrors.length === 0) {
        setResult({ status: 'valid', messageType });
      } else {
        // Generate simple suggestions based on common errors
        const suggestions = validationErrors.map(error => {
          if (error.field.includes('20')) {
            return `Check the reference number format in field ${error.field}. It should be alphanumeric and up to 16 characters.`;
          } else if (error.field.includes('32B')) {
            return `Verify the currency and amount format in field ${error.field}. Use format: CCCAMOUNT (e.g., USD100000,00).`;
          } else if (error.field.includes('31C') || error.field.includes('30')) {
            return `Ensure the date in field ${error.field} is in YYMMDD format (e.g., 241225 for December 25, 2024).`;
          } else if (error.field.includes('BIC')) {
            return `Check the BIC code format in field ${error.field}. It should be 8 or 11 characters (e.g., DEUTDEFFXXX).`;
          } else {
            return `Review the content and format of field ${error.field}. ${error.message}`;
          }
        });

        setResult({
          status: 'invalid',
          errors: validationErrors,
          suggestions,
          messageType,
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setResult({ 
        status: 'error', 
        message: 'An error occurred during validation. Please try again.' 
      });
    } finally {
      setIsLoading(false);
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                name="message"
                placeholder="Paste your SWIFT MT message here..."
                className="min-h-[400px] font-mono text-sm bg-background/50 focus-visible:ring-primary border-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full sm:w-auto" 
                  disabled={isLoading}
                >
                  {isLoading ? (
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
        {result?.status === 'valid' && (
          <Card className="border-accent/50 bg-accent/10 animate-in fade-in-50 zoom-in-95 shadow-lg">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <CheckCircle2 className="h-10 w-10 text-accent" />
              <CardTitle>Validation Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-foreground/80'>The {result.messageType} message is valid.</p>
            </CardContent>
          </Card>
        )}
        
        {result?.status === 'invalid' && (
          <>
            <Card className="border-destructive/50 bg-destructive/10 animate-in fade-in-50 zoom-in-95 shadow-lg">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <XCircle className="h-10 w-10 text-destructive" />
                <CardTitle>Validation Failed {result.messageType ? `for ${result.messageType}`: ''}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                 <p className='text-destructive/90'>{result.errors?.length} error(s) found in the message.</p>
                 {result.errors?.map((error, index) => (
                    <Alert key={index} variant="destructive" className='bg-destructive/10'>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{error.field}</AlertTitle>
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                ))}
              </CardContent>
            </Card>

            {result.suggestions && result.suggestions.length > 0 && (
              <Card className="border-primary/30 bg-primary/5 animate-in fade-in-50 zoom-in-95 shadow-lg" style={{ animationDelay: '150ms' }}>
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Lightbulb className="h-10 w-10 text-primary" />
                    <CardTitle>Fix Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {result.suggestions?.map((suggestion, index) => (
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

        {result?.status === 'error' && (
          <Card className="border-destructive/50 bg-destructive/10 animate-in fade-in-50 zoom-in-95 shadow-lg">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <XCircle className="h-10 w-10 text-destructive" />
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-destructive/90'>{result.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
