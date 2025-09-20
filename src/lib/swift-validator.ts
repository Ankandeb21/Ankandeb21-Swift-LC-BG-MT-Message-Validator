export interface ValidationError {
  field: string;
  message: string;
}

export const getSwiftMessageType = (message: string): string | null => {
  const block2Match = message.match(/{2:I(\d{3})/);
  if (block2Match && block2match[1]) {
    return `MT ${block2Match[1]}`;
  }
  const block2MatchO = message.match(/{2:O(\d{3})/);
  if (block2MatchO && block2MatchO[1]) {
    return `MT ${block2MatchO[1]}`;
  }
  return null;
};


// A more comprehensive set of rules for MT700 validation.
// This is not exhaustive but covers more ground.
const mt700Rules = [
  {
    field: ':27:',
    name: 'Sequence of Total',
    mandatory: true,
    regex: /^:27:\s*\d{1,2}\/\d{1,2}$/m,
    formatError: 'Field :27: (Sequence of Total) must be in the format n/n (e.g., 1/1).',
  },
  {
    field: ':40A:',
    name: 'Form of Documentary Credit',
    mandatory: true,
    regex: /^:40A:\s*(IRREVOCABLE|REVOCABLE|IRREVOCABLE\s+TRANSFERABLE|REVOCABLE\s+TRANSFERABLE|IRREVOCABLE\s+STANDBY|REVOCABLE\s+STANDBY)$/m,
    formatError: 'Field :40A: (Form of Documentary Credit) has an invalid codeword. Must be IRREVOCABLE, REVOCABLE, etc.',
  },
  {
    field: ':20:',
    name: 'Documentary Credit Number',
    mandatory: true,
    regex: /^:20:\s*[a-zA-Z0-9-]{1,16}$/m,
    formatError: 'Field :20: (Documentary Credit Number) must be 1 to 16 alphanumeric characters and hyphens.',
  },
  {
    field: ':23:',
    name: 'Reference to Pre-Advice',
    mandatory: false,
    regex: /^:23:\s*.{1,16}$/m,
    formatError: 'Field :23: (Reference to Pre-Advice) must be up to 16 characters.',
  },
  {
    field: ':31C:',
    name: 'Date of Issue',
    mandatory: false,
    regex: /^:31C:\s*\d{6}$/m,
    formatError: 'Field :31C: (Date of Issue) must be a valid date in YYMMDD format.',
  },
  {
    field: ':40E:',
    name: 'Applicable Rules',
    mandatory: false,
    regex: /^:40E:\s*(UCP\s+LATEST\s+VERSION|ISP\s+LATEST\s+VERSION|OTHR)\s*(\/.{1,35})?$/m,
    formatError: 'Field :40E: (Applicable Rules) has an invalid format or codeword.',
  },
  {
    field: ':31D:',
    name: 'Date and Place of Expiry',
    mandatory: true,
    regex: /^:31D:\s*\d{6}.{1,29}$/m,
    formatError: 'Field :31D: (Date and Place of Expiry) must have a YYMMDD date followed by a place (up to 29 chars).',
  },
  {
    field: ':50:',
    name: 'Applicant',
    mandatory: true,
    regex: /^:50:(\r\n|\n).{1,50}((\r\n|\n).{1,50}){0,3}$/m,
    formatError: 'Field :50: (Applicant) must contain name and address, up to 4 lines of 50 characters each.',
  },
  {
    field: ':59:',
    name: 'Beneficiary',
    mandatory: true,
    regex: /^:59:(\r\n|\n).{1,50}((\r\n|\n).{1,50}){0,3}$/m,
    formatError: 'Field :59: (Beneficiary) must contain name and address, up to 4 lines of 50 characters each.',
  },
  {
    field: ':32B:',
    name: 'Currency Code, Amount',
    mandatory: true,
    regex: /^:32B:\s*[A-Z]{3}\d{1,15}(?:,\d{1,2})?$/m,
    formatError: 'Field :32B: (Currency Code, Amount) must have a 3-letter currency code and a valid numeric amount (e.g., USD100000,50).',
  },
  {
    field: ':39A:',
    name: 'Percentage Credit Amount Tolerance',
    mandatory: false,
    regex: /^:39A:\s*\d{1,2}\/\d{1,2}$/m,
    formatError: 'Field :39A: (Percentage Credit Amount Tolerance) must be in format n/n.',
  },
  {
    field: ':39B:',
    name: 'Maximum Credit Amount',
    mandatory: false,
    regex: /^:39B:\s*.{1,13}$/m,
    formatError: 'Field :39B: (Maximum Credit Amount) has an invalid format.',
  },
  {
    field: ':39C:',
    name: 'Additional Amounts Covered',
    mandatory: false,
    regex: /^:39C:(\r\n|\n).{1,50}((\r\n|\n).{1,50}){0,3}$/m,
    formatError: 'Field :39C: (Additional Amounts Covered) must be up to 4 lines of 50 characters each.',
  },
  {
    field: ':41A:', // or 41D
    name: 'Available With ... By ...',
    mandatory: true,
    regex: /^:41(A|D):/m,
    formatError: 'Field :41A: or :41D: (Available With) is missing or has an invalid format.',
  },
  {
    field: ':42C:',
    name: 'Drafts at...',
    mandatory: false,
    regex: /^:42C:(\r\n|\n).{1,35}((\r\n|\n).{1,35}){0,1}$/m,
    formatError: 'Field :42C: (Drafts at) must be up to 2 lines of 35 characters each.',
  },
  {
    field: ':42A:', // or 42D
    name: 'Drawee',
    mandatory: false,
    regex: /^:42(A|D):/m,
  },
  {
    field: ':42P:',
    name: 'Deferred Payment Details',
    mandatory: false,
    regex: /^:42P:(\r\n|\n).{1,50}((\r\n|\n).{1,50}){0,3}$/m,
    formatError: 'Field :42P: (Deferred Payment Details) must be up to 4 lines of 50 characters each.',
  },
  {
    field: ':43P:',
    name: 'Partial Shipments',
    mandatory: false,
    regex: /^:43P:\s*(ALLOWED|NOT\sALLOWED|CONDITIONAL)$/m,
    formatError: 'Field :43P: (Partial Shipments) must be ALLOWED, NOT ALLOWED, or CONDITIONAL.',
  },
  {
    field: ':43T:',
    name: 'Transhipment',
    mandatory: false,
    regex: /^:43T:\s*(ALLOWED|NOT\sALLOWED|CONDITIONAL)$/m,
    formatError: 'Field :43T: (Transhipment) must be ALLOWED, NOT ALLOWED, or CONDITIONAL.',
  },
  {
    field: ':44A:',
    name: 'Place of Taking in Charge/Dispatch from',
    mandatory: false,
    regex: /^:44A:\s*.{1,65}$/m,
    formatError: 'Field :44A: (Place of Taking in Charge) must be up to 65 characters.',
  },
  {
    field: ':44E:',
    name: 'Port of Loading/Airport of Departure',
    mandatory: false,
    regex: /^:44E:\s*.{1,65}$/m,
    formatError: 'Field :44E: (Port of Loading) must be up to 65 characters.',
  },
  {
    field: ':44F:',
    name: 'Port of Discharge/Airport of Destination',
    mandatory: false,
    regex: /^:44F:\s*.{1,65}$/m,
    formatError: 'Field :44F: (Port of Discharge) must be up to 65 characters.',
  },
  {
    field: ':44B:',
    name: 'Place of Final Destination',
    mandatory: false,
    regex: /^:44B:\s*.{1,65}$/m,
    formatError: 'Field :44B: (Place of Final Destination) must be up to 65 characters.',
  },
  {
    field: ':44C:',
    name: 'Latest Date of Shipment',
    mandatory: false,
    regex: /^:44C:\s*\d{6}$/m,
    formatError: 'Field :44C: (Latest Date of Shipment) must be a valid date in YYMMDD format.',
  },
  {
    field: ':44D:',
    name: 'Shipment Period',
    mandatory: false,
    regex: /^:44D:(\r\n|\n).{1,50}((\r\n|\n).{1,50}){0,5}$/m,
    formatError: 'Field :44D: (Shipment Period) must be up to 6 lines of 50 characters each.',
  },
  {
    field: ':48:',
    name: 'Period for Presentation',
    mandatory: false,
    regex: /^:48:(\r\n|\n).{1,50}((\r\n|\n).{1,50}){0,3}$/m,
    formatError: 'Field :48: (Period for Presentation) must be up to 4 lines of 50 characters.',
  },
  {
    field: ':49:',
    name: 'Confirmation Instructions',
    mandatory: true,
    regex: /^:49:\s*(CONFIRM|MAY\sADD|WITHOUT)$/m,
    formatError: 'Field :49: (Confirmation Instructions) must be one of CONFIRM, MAY ADD, or WITHOUT.',
  },
  {
    field: ':53A:',
    name: 'Reimbursing Bank',
    mandatory: false,
    regex: /^:53A:\s*[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/m,
    formatError: 'Field :53A: (Reimbursing Bank) must be a valid BIC.',
  },
  {
    field: ':71B:',
    name: 'Charges',
    mandatory: false,
    regex: /^:71B:(\r\n|\n).{1,35}((\r\n|\n).{1,35}){0,5}$/m,
    formatError: 'Field :71B: (Charges) must be up to 6 lines of 35 characters each.',
  },
  {
    field: ':71D:',
    name: 'Charges',
    mandatory: false,
    regex: /^:71D:(\r\n|\n).{1,35}((\r\n|\n).{1,35}){0,5}$/m,
    formatError: 'Field :71D: (Charges) must be up to 6 lines of 35 characters each.',
  },
];

const mt701Rules = [
    {
    field: ':27:',
    name: 'Sequence of Total',
    mandatory: true,
    regex: /^:27:\s*\d{1,2}\/\d{1,2}$/m,
    formatError: 'Field :27: (Sequence of Total) must be in the format n/n (e.g., 2/2).',
  },
  {
    field: ':20:',
    name: 'Documentary Credit Number',
    mandatory: true,
    regex: /^:20:\s*[a-zA-Z0-9-]{1,16}$/m,
    formatError: 'Field :20: (Documentary Credit Number) must be 1 to 16 alphanumeric characters and hyphens.',
  },
  {
    field: ':21:',
    name: 'Presenting Bank\'s Reference',
    mandatory: true,
    regex: /^:21:\s*[a-zA-Z0-9-]{1,16}$/m,
    formatError: 'Field :21: (Presenting Bank\'s Reference) must be 1 to 16 alphanumeric characters and hyphens.',
  },
];


const messageRules: { [key: string]: any[] } = {
  'MT 700': mt700Rules,
  'MT 701': mt701Rules,
  // Add other message type rules here.
};


export const validateSwiftMessage = (message: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  const messageType = getSwiftMessageType(message);
  const rules = messageType ? messageRules[messageType] || [] : [];

  // If no rules are defined for the message type, perform a basic structure check and return.
  if (rules.length === 0 && messageType) {
    if (!message.startsWith('{1:') || !message.includes('{2:')) {
      errors.push({ field: 'Structure', message: 'Invalid basic block structure. Message must contain at least {1:} and {2:} blocks.' });
    }
    return errors;
  }
  
  // If we have rules (currently only for MT 700), proceed with detailed validation.
  if (messageType === 'MT 700') {
      const block4Match = message.replace(/\r\n/g, '\n').match(/{4:\s*\n((.|\n)*?)\n-}/);
      if (!block4Match) {
        errors.push({ field: 'Structure', message: 'Block 4 ({4:...}) is missing or malformed.' });
        return errors;
      }
      
      const block4Content = block4Match[1];
      
      const fields = block4Content.split(/(?=\n:)/).map(f => f.trim());

      rules.forEach(rule => {
        if (rule.mandatory) {
          const fieldPresent = fields.some(field => field.startsWith(rule.field));
          if (!fieldPresent) {
            if (rule.field === ':41A:') {
              if (!fields.some(field => field.startsWith(':41D:'))) {
                errors.push({ field: rule.field, message: `Mandatory field ${rule.name} (:41A: or :41D:) is missing.` });
              }
            } else {
              errors.push({ field: rule.field, message: `Mandatory field ${rule.name} (${rule.field}) is missing.` });
            }
          }
        }
      });

      fields.forEach(field => {
        const fieldTagMatch = field.match(/^:\d{2}[A-Z]?:/);
        if (!fieldTagMatch) return;
        const fieldTag = fieldTagMatch[0];

        const rule = rules.find(r => fieldTag.startsWith(r.field));
        
        if (rule && rule.formatError) {
          let testableField = field;
          if (!rule.regex.source.includes('\\n')) {
             testableField = field.replace(/\r\n|\n/g, ' ');
          }
          
          if (!rule.regex.test(testableField)) {
            errors.push({ field: rule.field, message: rule.formatError });
          }
        }
      });
  }


  // Basic block structure check for all messages
  if (!message.startsWith('{1:') || !message.includes('{2:')) {
    errors.push({ field: 'Structure', message: 'Invalid basic block structure. Message must contain at least {1:} and {2:} blocks.' });
  }

  // Prevent duplicate error messages
  return [...new Map(errors.map(item => [item.message, item])).values()];
};
