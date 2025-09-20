export interface ValidationError {
  field: string;
  message: string;
}

// A simplified set of rules for MT700 validation.
// This is not exhaustive and for demonstration purposes.
const mt700Rules = [
  {
    field: ':27:',
    name: 'Sequence of Total',
    mandatory: true,
    regex: /^:27:\s*\d{1,2}\/\d{1,2}$/,
    formatError: 'Field :27: must be in the format n/n (e.g., 1/1).',
  },
  {
    field: ':40A:',
    name: 'Form of Documentary Credit',
    mandatory: true,
    regex: /^:40A:\s*(IRREVOCABLE|REVOCABLE|IRREVOCABLE\sTRANSFERABLE|REVOCABLE\sTRANSFERABLE|IRREVOCABLE\sSTANDBY|REVOCABLE\sSTANDBY)$/,
    formatError: 'Field :40A: has an invalid value for Form of Documentary Credit.',
  },
  {
    field: ':20:',
    name: 'Documentary Credit Number',
    mandatory: true,
    regex: /^:20:\s*[A-Z0-9-]{1,16}$/,
    formatError: 'Field :20: must be up to 16 characters alphanumeric.',
  },
  {
    field: ':31C:',
    name: 'Date of Issue',
    mandatory: false, // Can be 31C or 31D
    regex: /^:31C:\s*\d{6}$/,
    formatError: 'Field :31C: must be a valid date in YYMMDD format.',
  },
  {
    field: ':31D:',
    name: 'Date and Place of Expiry',
    mandatory: true,
    regex: /^:31D:\s*\d{6}.+$/,
    formatError: 'Field :31D: must have a date in YYMMDD format followed by the place of expiry.',
  },
  {
    field: ':50:',
    name: 'Applicant',
    mandatory: true,
    regex: /^:50:/, // Just check for presence
  },
  {
    field: ':59:',
    name: 'Beneficiary',
    mandatory: true,
    regex: /^:59:/, // Just check for presence
  },
  {
    field: ':32B:',
    name: 'Currency Code, Amount',
    mandatory: true,
    regex: /^:32B:\s*[A-Z]{3}\d+([,.]\d{1,2})?$/,
    formatError: 'Field :32B: must have a 3-letter currency code and a numeric amount.',
  },
  {
    field: ':41A:', // or 41D
    name: 'Available With ... By ...',
    mandatory: true,
    regex: /^:41(A|D):/,
    formatError: 'Field :41A: or :41D: (Available With) is missing or has an invalid format.',
  },
  {
    field: ':42C:',
    name: 'Drafts at...',
    mandatory: false,
    regex: /^:42C:/,
  },
  {
    field: ':42A:', // or 42D
    name: 'Drawee',
    mandatory: false,
    regex: /^:42(A|D):/,
  },
  {
    field: ':43P:',
    name: 'Partial Shipments',
    mandatory: false,
    regex: /^:43P:/,
  },
  {
    field: ':43T:',
    name: 'Transhipment',
    mandatory: false,
    regex: /^:43T:/,
  },
  {
    field: ':44A:',
    name: 'Loading on Board/Dispatch/Taking in Charge at/from',
    mandatory: false,
    regex: /^:44A:/,
  },
  {
    field: ':44B:',
    name: 'For Transportation to',
    mandatory: false,
    regex: /^:44B:/,
  },
  {
    field: ':44C:', // or 44D
    name: 'Latest Date of Shipment',
    mandatory: false,
    regex: /^:44(C|D):/,
  },
  {
    field: ':48:',
    name: 'Period for Presentation',
    mandatory: false,
    regex: /^:48:/,
  },
  {
    field: ':49:',
    name: 'Confirmation Instructions',
    mandatory: true,
    regex: /^:49:\s*(CONFIRM|MAY\sADD|WITHOUT)$/,
    formatError: 'Field :49: must be one of CONFIRM, MAY ADD, or WITHOUT.',
  },
  {
    field: ':71B:',
    name: 'Charges',
    mandatory: false,
    regex: /^:71B:/,
  },
];

export const validateSwiftMessage = (message: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  const lines = message.split('\n').map(line => line.trim()).filter(line => line.startsWith(':'));

  // Check for mandatory fields
  mt700Rules.forEach(rule => {
    if (rule.mandatory) {
      const fieldPresent = lines.some(line => line.startsWith(rule.field));
      if (!fieldPresent && rule.field === ':41A:') {
        // Special handling for 41A or 41D
        const alternativeFieldPresent = lines.some(line => line.startsWith(':41D:'));
        if (!alternativeFieldPresent) {
          errors.push({ field: rule.field, message: `Mandatory field :41A: or :41D: is missing.` });
        }
      } else if (!fieldPresent && rule.field !== ':41A:') {
        errors.push({ field: rule.field, message: `Mandatory field ${rule.name} (${rule.field}) is missing.` });
      }
    }
  });

  // Check for format of present fields
  lines.forEach(line => {
    const fieldTagMatch = line.match(/^:\d{2}[A-Z]?:/);
    if (!fieldTagMatch) return;
    const fieldTag = fieldTagMatch[0];

    const rule = mt700Rules.find(r => fieldTag.startsWith(r.field));

    if (rule && rule.formatError) {
      if (!rule.regex.test(line)) {
        errors.push({ field: rule.field, message: rule.formatError });
      }
    }
  });

  // Basic block structure check
  if (!message.startsWith('{1:') || !message.includes('{2:') || !message.includes('{4:')) {
    errors.push({ field: 'Structure', message: 'Invalid basic block structure. Message must contain {1:}, {2:}, and {4:} blocks.' });
  }

  return [...new Map(errors.map(item => [item.message, item])).values()];
};
