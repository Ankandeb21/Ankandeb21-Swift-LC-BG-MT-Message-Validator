export interface ValidationError {
  field: string;
  message: string;
}

export const getSwiftMessageType = (message: string): string | null => {
  const block2Match = message.match(/{2:I(\d{3})/);
  if (block2Match && block2Match[1]) {
    return `MT ${block2Match[1]}`;
  }
  const block2MatchO = message.match(/{2:O(\d{3})/);
  if (block2MatchO && block2MatchO[1]) {
    return `MT ${block2MatchO[1]}`;
  }
  return null;
};

// Generic validation helpers
const isMandatory = (mandatory: boolean, content: string, tag: string) => mandatory && !content.includes(`:${tag}:`);
const length = (len: number) => new RegExp(`^.{1,${len}}$`);
const multiline = (lines: number, chars: number) => new RegExp(`^(.{1,${chars}}(\\r\\n?|\\n)?){1,${lines}}$`);
const alphanumeric = () => /^[a-zA-Z0-9]+$/;
const bic = () => /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const date = () => /^\d{6}$/;
const currencyAndAmount = () => /^[A-Z]{3}\d{1,15},\d{1,2}$/;
const narrative = () => /^(.|\r\n?|\n)+$/m; // Very basic check for narrative text

const createRule = (
  field: string,
  name: string,
  mandatory: boolean,
  regex: RegExp,
  formatError: string,
  optionalAlternative?: string
) => ({ field, name, mandatory, regex, formatError, optionalAlternative });

const mt700Rules = [
  createRule('27', 'Sequence of Total', true, /^\d{1,2}\/\d{1,2}$/m, 'Format must be n/n.'),
  createRule('40A', 'Form of Documentary Credit', true, /^(IRREVOCABLE|REVOCABLE|IRREVOCABLE\s+TRANSFERABLE|REVOCABLE\s+TRANSFERABLE|IRREVOCABLE\s+STANDBY|REVOCABLE\s+STANDBY)$/m, 'Invalid codeword.'),
  createRule('20', 'Documentary Credit Number', true, /^[a-zA-Z0-9-]{1,16}$/m, 'Must be 1-16 alphanumeric chars and hyphens.'),
  createRule('31C', 'Date of Issue', false, date(), 'Must be a valid date in YYMMDD format.'),
  createRule('40E', 'Applicable Rules', false, /^(UCP\s+LATEST\s+VERSION|ISP\s+LATEST\s+VERSION|OTHR)\s*(\/.{1,35})?$/m, 'Invalid format or codeword.'),
  createRule('31D', 'Date and Place of Expiry', true, /^\d{6}.{1,29}$/m, 'Must be YYMMDD date followed by a place.'),
  createRule('50', 'Applicant', true, multiline(4, 35), 'Must be up to 4 lines of 35 characters each.'),
  createRule('59', 'Beneficiary', true, multiline(4, 35), 'Must be up to 4 lines of 35 characters each.'),
  createRule('32B', 'Currency Code, Amount', true, currencyAndAmount(), 'Invalid currency code or amount format.'),
  createRule('41A', 'Available With... By...', true, narrative(), 'Field is mandatory.', '41D'),
  createRule('41D', 'Available With... By...', true, narrative(), 'Field is mandatory.', '41A'),
  createRule('43P', 'Partial Shipments', false, /^(ALLOWED|NOT\sALLOWED|CONDITIONAL)$/m, 'Must be ALLOWED, NOT ALLOWED, or CONDITIONAL.'),
  createRule('43T', 'Transhipment', false, /^(ALLOWED|NOT\sALLOWED|CONDITIONAL)$/m, 'Must be ALLOWED, NOT ALLOWED, or CONDITIONAL.'),
  createRule('44C', 'Latest Date of Shipment', false, date(), 'Must be a valid date in YYMMDD format.'),
  createRule('45A', 'Description of Goods and/or Services', false, multiline(100, 50), 'Exceeds max length.'),
  createRule('46A', 'Documents Required', false, multiline(100, 50), 'Exceeds max length.'),
  createRule('47A', 'Additional Conditions', false, multiline(100, 50), 'Exceeds max length.'),
  createRule('48', 'Period for Presentation', false, multiline(4, 35), 'Exceeds max length.'),
  createRule('49', 'Confirmation Instructions', true, /^(CONFIRM|MAY\sADD|WITHOUT)$/m, 'Must be CONFIRM, MAY ADD, or WITHOUT.'),
  createRule('53A', 'Reimbursing Bank', false, bic(), 'Must be a valid BIC.'),
  createRule('71B', 'Charges', false, multiline(6, 35), 'Exceeds max length (6 lines of 35 chars).'),
  createRule('78', 'Instructions to Paying/Accepting/Negotiating Bank', false, multiline(12, 50), 'Exceeds max length.'),
];

const mt701Rules = [
  createRule('27', 'Sequence of Total', true, /^\d{1,2}\/\d{1,2}$/m, 'Format must be n/n, e.g., 2/2.'),
  createRule('20', 'Documentary Credit Number', true, /^[a-zA-Z0-9-]{1,16}$/m, 'Must be 1-16 alphanumeric chars and hyphens.'),
  createRule('21', 'Presenting Bank\'s Reference', true, /^[a-zA-Z0-9-]{1,16}$/m, 'Must be 1-16 alphanumeric chars and hyphens.'),
  createRule('45B', 'Description of Goods and/or Services', false, multiline(99, 50), 'Exceeds max length.'),
];

const mt707Rules = [
  createRule('20', 'Sender\'s Reference', true, length(16), 'Max 16 characters.'),
  createRule('21', 'Receiver\'s Reference', true, length(16), 'Max 16 characters.'),
  createRule('31C', 'Date of Issue', true, date(), 'Must be YYMMDD.'),
  createRule('30', 'Date of Amendment', true, date(), 'Must be YYMMDD.'),
  createRule('26E', 'Number of Amendment', true, /^\d{1,3}\/.{1,16}$/m, 'Format n/narrative.'),
  createRule('59', 'Beneficiary', false, multiline(4, 35), 'Exceeds max length.'),
  createRule('32B', 'Increase of DC Amount', false, currencyAndAmount(), 'Invalid format.'),
  createRule('33B', 'Decrease of DC Amount', false, currencyAndAmount(), 'Invalid format.'),
  createRule('34B', 'New DC Amount', false, currencyAndAmount(), 'Invalid format.'),
  createRule('79', 'Narrative', false, multiline(200, 50), 'Exceeds max length.'),
];

const mt710Rules = [
    createRule('20', 'Advising Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Issuing Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('31C', 'Date of Issue', true, date(), 'Must be YYMMDD.'),
    createRule('31D', 'Date and Place of Expiry', true, /^\d{6}.{1,29}$/m, 'Must be YYMMDD date followed by a place.'),
    createRule('50', 'Applicant', true, multiline(4, 35), 'Exceeds max length.'),
    createRule('59', 'Beneficiary', true, multiline(4, 35), 'Exceeds max length.'),
    createRule('32B', 'Currency Code, Amount', true, currencyAndAmount(), 'Invalid currency/amount format.'),
    createRule('72', 'Sender to Receiver Information', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt720Rules = [
    createRule('20', 'Transferring Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'DC Number', true, length(16), 'Max 16 characters.'),
    createRule('31C', 'Date of Transfer', true, date(), 'Must be YYMMDD.'),
    createRule('40F', 'Applicable Rules', true, /^(UCP\s+LATEST\s+VERSION|OTHR)$/m, 'Invalid codeword.'),
    createRule('32B', 'Transferred Amount', true, currencyAndAmount(), 'Invalid currency/amount format.'),
    createRule('59', 'Transferee (New Beneficiary)', true, multiline(4, 35), 'Exceeds max length.'),
    createRule('72', 'Sender to Receiver Information', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt730Rules = [
    createRule('20', 'Acknowledging Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Issuing Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('30', 'Date of Advice', true, date(), 'Must be YYMMDD.'),
    createRule('32B', 'Advised Amount', true, currencyAndAmount(), 'Invalid currency/amount format.'),
    createRule('71B', 'Charges', false, multiline(6, 35), 'Exceeds max length.'),
    createRule('72', 'Sender to Receiver Information', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt732Rules = [
    createRule('20', 'Claiming Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Issuing Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('32A', 'Date, Currency, Amount', true, /^\d{6}[A-Z]{3}\d{1,15},\d{1,2}$/m, 'Format must be YYMMDDCCYAMOUNT.'),
    createRule('53A', 'Sender\'s Correspondent', false, bic(), 'Must be a valid BIC.'),
    createRule('72', 'Sender to Receiver Information', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt740Rules = [
    createRule('20', 'Issuing Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('31D', 'Date and Place of Expiry', true, /^\d{6}.{1,29}$/m, 'Must be YYMMDD date followed by a place.'),
    createRule('40B', 'Form of Reimbursement', true, /^(IRREVOCABLE|REVOCABLE)$/m, 'Must be IRREVOCABLE or REVOCABLE.'),
    createRule('41A', 'Reimbursing Bank', true, narrative(), 'Field is mandatory.'),
    createRule('42A', 'Drawee Bank', true, bic(), 'Must be a valid BIC.'),
    createRule('32B', 'Reimbursement Amount', true, currencyAndAmount(), 'Invalid currency/amount format.'),
    createRule('71B', 'Charges', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt742Rules = [
    createRule('20', 'Claiming Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'DC Number', true, length(16), 'Max 16 characters.'),
    createRule('32B', 'Claimed Amount', true, currencyAndAmount(), 'Invalid currency/amount format.'),
    createRule('53A', 'Issuing Bank', true, bic(), 'Must be a valid BIC.'),
    createRule('71B', 'Charges Claimed', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt747Rules = [
    createRule('20', 'Amending Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Original Auth to Reimburse Ref', true, length(16), 'Max 16 characters.'),
    createRule('30', 'Date of Amendment', true, date(), 'Must be YYMMDD.'),
    createRule('33B', 'New Reimbursement Amount', false, currencyAndAmount(), 'Invalid format.'),
    createRule('72', 'Sender to Receiver Information', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt750Rules = [
    createRule('20', 'Presenting Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Related Reference (DC Number)', true, length(16), 'Max 16 characters.'),
    createRule('32B', 'Principal Amount', true, currencyAndAmount(), 'Invalid currency/amount format.'),
    createRule('77J', 'Discrepancies', true, multiline(200, 50), 'Exceeds max length.'),
];

const mt752Rules = [
    createRule('20', 'Issuing Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Related Reference (DC Number)', true, length(16), 'Max 16 characters.'),
    createRule('32B', 'Amount Paid/Accepted/Negotiated', true, currencyAndAmount(), 'Invalid currency/amount format.'),
    createRule('53A', 'Paying Bank', false, bic(), 'Must be a valid BIC.'),
    createRule('72', 'Sender to Receiver Information', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt760Rules = [
    createRule('27', 'Sequence of Total', true, /^\d{1,2}\/\d{1,2}$/m, 'Format must be n/n.'),
    createRule('22A', 'Purpose of Message', true, /^(ISSUE|ISSSUE)$/m, 'Must be ISSUE or ISSSUE.'), // ISSSUE is a common typo
    createRule('20', 'Guarantee Number', true, length(16), 'Max 16 characters.'),
    createRule('30', 'Date of Issue', true, date(), 'Must be YYMMDD.'),
    createRule('40C', 'Applicable Rules', true, /^(URDG\s+LATEST\s+VERSION|ISPR\s+LATEST\s+VERSION|OTHR)$/m, 'Invalid codeword.'),
    createRule('22D', 'Form of Guarantee', true, /^(ADVI|PREP|AUTH|NOTI)$/m, 'Invalid form of guarantee.'),
    createRule('52A', 'Issuing Bank', false, bic(), 'Must be a valid BIC.'),
    createRule('59', 'Beneficiary', true, multiline(4, 35), 'Exceeds max length.'),
    createRule('77C', 'Details of Guarantee', true, multiline(100, 65), 'Exceeds max length.'),
];

const mt767Rules = [
    createRule('20', 'Amending Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Original Guarantee Number', true, length(16), 'Max 16 characters.'),
    createRule('30', 'Date of Amendment', true, date(), 'Must be YYMMDD.'),
    createRule('23', 'Amendment Details', true, narrative(), 'Field is mandatory.'),
    createRule('77C', 'Further Details', false, multiline(100, 65), 'Exceeds max length.'),
];

const mt768Rules = [
    createRule('20', 'Acknowledging Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Related Guarantee Number', true, length(16), 'Max 16 characters.'),
    createRule('30', 'Date of Acknowledgment', true, date(), 'Must be YYMMDD.'),
    createRule('77C', 'Acknowledgment Details', true, multiline(100, 65), 'Exceeds max length.'),
];

const mt769Rules = [
    createRule('20', 'Bank\'s Reference', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Related Guarantee Number', true, length(16), 'Max 16 characters.'),
    createRule('30', 'Effective Date', true, date(), 'Must be YYMMDD.'),
    createRule('39C', 'Amount of Reduction or Release', true, narrative(), 'Field is mandatory.'),
    createRule('77C', 'Further Details', false, multiline(100, 65), 'Exceeds max length.'),
];

const mt799Rules = [
    createRule('20', 'Transaction Reference Number', true, length(16), 'Max 16 characters.'),
    createRule('21', 'Related Reference', false, length(16), 'Max 16 characters.'),
    createRule('79', 'Narrative', true, multiline(35, 50), 'Exceeds max length (35 lines of 50 chars).'),
];


const messageRules: { [key: string]: any[] } = {
  'MT 700': mt700Rules,
  'MT 701': mt701Rules,
  'MT 707': mt707Rules,
  'MT 710': mt710Rules,
  'MT 720': mt720Rules,
  'MT 730': mt730Rules,
  'MT 732': mt732Rules,
  'MT 740': mt740Rules,
  'MT 742': mt742Rules,
  'MT 747': mt747Rules,
  'MT 750': mt750Rules,
  'MT 752': mt752Rules,
  'MT 760': mt760Rules,
  'MT 767': mt767Rules,
  'MT 768': mt768Rules,
  'MT 769': mt769Rules,
  'MT 799': mt799Rules,
};


export const validateSwiftMessage = (message: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!message.startsWith('{1:') || !message.includes('{2:')) {
    errors.push({ field: 'Structure', message: 'Invalid basic block structure. Message must contain at least {1:} and {2:} blocks.' });
  }

  const block4Match = message.replace(/\r\n/g, '\n').match(/{4:\s*\n((.|\n)*?)\n-}/);
  if (!block4Match) {
    errors.push({ field: 'Structure', message: 'Block 4 ({4:...}) is missing or malformed.' });
    return errors; // Cannot proceed without Block 4
  }

  const block4Content = block4Match[1];
  const messageType = getSwiftMessageType(message);
  const rules = messageType ? messageRules[messageType] : undefined;

  if (!rules) {
    if (!messageType) {
      errors.push({ field: 'Message Type', message: 'Could not determine SWIFT message type from Block 2.' });
    } else {
      errors.push({ field: 'Validator', message: `No validation rules defined for ${messageType}.` });
    }
    return errors;
  }
  
  const getFieldValue = (tag: string): string | undefined => {
      // This regex finds a field tag and captures the content until the next field tag or end of block4.
      const regex = new RegExp(`:${tag}:((.|\n)*?)(?=\n:[0-9]{2}[A-Z]?:|$)`, 'm');
      const match = block4Content.match(regex);
      return match ? match[1].trim() : undefined;
  };
  
  // Check for mandatory fields
  rules.forEach(rule => {
      if (rule.mandatory) {
          const fieldPresent = getFieldValue(rule.field) !== undefined;
          if (!fieldPresent) {
              // Handle optional alternatives like 41A/41D
              if (rule.optionalAlternative) {
                  const altFieldPresent = getFieldValue(rule.optionalAlternative) !== undefined;
                  if (!altFieldPresent) {
                       errors.push({ field: `:${rule.field}: / :${rule.optionalAlternative}:`, message: `Mandatory field ${rule.name} is missing.` });
                  }
              } else {
                  errors.push({ field: `:${rule.field}:`, message: `Mandatory field ${rule.name} is missing.` });
              }
          }
      }
  });

  // Split block 4 into individual fields and validate each one
  const fields = block4Content.split(/(?=\n:)/).map(f => f.trim()).filter(f => f.startsWith(':'));
  
  fields.forEach(field => {
      const tagMatch = field.match(/^:([0-9]{2}[A-Z]?):/);
      if (!tagMatch) {
          errors.push({ field: 'Unknown', message: `Malformed field found: "${field.substring(0, 20)}..."` });
          return;
      }
      const tag = tagMatch[1];
      const value = field.substring(tagMatch[0].length).trim();
      
      const rule = rules.find(r => r.field === tag);
      if (rule) {
          if (!rule.regex.test(value)) {
              errors.push({ field: `:${tag}:`, message: `${rule.name}: ${rule.formatError}` });
          }
      }
      // Optional: Add a check for unknown fields for a specific message type
      // else {
      //     errors.push({ field: `:${tag}:`, message: `Field is not valid for ${messageType}.` });
      // }
  });
  

  // Prevent duplicate error messages
  return [...new Map(errors.map(item => [`${item.field}${item.message}`, item])).values()];
};
