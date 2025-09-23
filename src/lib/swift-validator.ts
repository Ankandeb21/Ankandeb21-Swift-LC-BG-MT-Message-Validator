// validateSwiftMessage.ts
export interface ValidationError {
  field: string;
  message: string;
}

// Helper types
type CustomValidator = (content: string, getField: (tag: string) => string | undefined) => ValidationError | null;
type Validator = RegExp | CustomValidator;

interface Rule {
  field: string;
  name: string;
  mandatory: boolean;
  validator: Validator;
  formatError: string;
  optionalAlternative?: string;
}

// ---------- Basic helper regex factories ----------
const bic = () => /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;
const dateYYMMDD = () => /^\d{6}$/;
const currencyAndAmount = () => /^[A-Z]{3}\d{1,15}(?:,\d{1,2})?$/;
const dateYYMMDDAmount = () => /^\d{6}[A-Z]{3}\d{1,15}(?:,\d{1,2})?$/;
const narrative = () => /^(.|\r\n?|\n)+$/m;
const multiline = (maxLines: number, maxCharsPerLine: number): RegExp => {
  return new RegExp(`^(?:[^\r\n]{1,${maxCharsPerLine}}(?:\r?\n|$)){1,${maxLines}}$`);
};
const validateT26: CustomValidator = (content: string) => {
  if (content.length < 1 || content.length > 16) {
    return { field: '', message: 'Must be 1-16 characters.' };
  }
  if (content.startsWith('/') || content.endsWith('/') || content.includes('//')) {
    return { field: '', message: "Must not start or end with '/' and must not contain '//'." };
  }
  return null;
};
const validateSequence: CustomValidator = (content: string) => {
    const parts = content.split('/');
    if (parts.length !== 2) return { field: ':27:', message: 'Format must be n/n.' };
    const seq = parseInt(parts[0], 10);
    const total = parseInt(parts[1], 10);
    if (Number.isNaN(seq) || Number.isNaN(total) || seq < 1 || total < 1 || seq > total) {
      return { field: ':27:', message: 'Sequence number must be less than or equal to total.' };
    }
    return null;
};

// ---------- Rules definition ----------
const createRule = (
  field: string,
  name: string,
  mandatory: boolean,
  validator: Validator,
  formatError: string,
  optionalAlternative?: string
): Rule => ({ field: field.toUpperCase(), name, mandatory, validator, formatError, optionalAlternative });

const mt700Rules: Rule[] = [
  createRule('27', 'Sequence of Total', true, validateSequence, 'Format must be n/n and sequence <= total.'),
  createRule('40A', 'Form of Documentary Credit', true, /^(IRREVOCABLE|REVOCABLE|IRREVOCABLE\s+TRANSFERABLE|REVOCABLE\s+TRANSFERABLE|IRREVOCABLE\s+STANDBY|REVOCABLE\s+STANDBY)$/im, 'Invalid codeword.'),
  createRule('20', 'Documentary Credit Number', true, validateT26, 'Must be 1-16 chars and not violate T26.'),
  createRule('31C', 'Date of Issue', false, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
  createRule('40E', 'Applicable Rules', false, narrative(), 'Invalid format or codeword.'),
  createRule('31D', 'Date and Place of Expiry', true, /^\d{6}.{1,29}$/m, 'Must be YYMMDD date followed by a place.'),
  createRule('50', 'Applicant', true, multiline(4, 35), 'Must be up to 4 lines of 35 characters each.'),
  createRule('59', 'Beneficiary', true, multiline(4, 35), 'Must be up to 4 lines of 35 characters each.'),
  createRule('32B', 'Currency Code, Amount', true, currencyAndAmount(), 'Invalid currency code or amount format.'),
  createRule('41A', 'Available With... By...', true, narrative(), 'Field is mandatory.', '41D'),
  createRule('41D', 'Available With... By...', true, narrative(), 'Field is mandatory.', '41A'),
  createRule('43P', 'Partial Shipments', false, /^(ALLOWED|NOT\sALLOWED|CONDITIONAL)$/im, 'Must be ALLOWED, NOT ALLOWED, or CONDITIONAL.'),
  createRule('43T', 'Transhipment', false, /^(ALLOWED|NOT\sALLOWED|CONDITIONAL)$/im, 'Must be ALLOWED, NOT ALLOWED, or CONDITIONAL.'),
  createRule('44C', 'Latest Date of Shipment', false, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
  createRule('45A', 'Description of Goods and/or Services', false, multiline(100, 50), 'Exceeds max length.'),
  createRule('46A', 'Documents Required', false, multiline(100, 50), 'Exceeds max length.'),
  createRule('47A', 'Additional Conditions', false, multiline(100, 50), 'Exceeds max length.'),
  createRule('49', 'Confirmation Instructions', true, /^(CONFIRM|MAY\s+ADD|WITHOUT)$/im, 'Must be CONFIRM, MAY ADD, or WITHOUT.'),
  createRule('53A', 'Reimbursing Bank', false, bic(), 'Must be a valid BIC.'),
  createRule('71B', 'Charges', false, multiline(6, 35), 'Exceeds max length (6 lines of 35 chars).'),
  createRule('78', 'Instructions to Paying/Accepting/Negotiating Bank', false, multiline(12, 50), 'Exceeds max length.')
];

const mt701Rules: Rule[] = [
  createRule('27', 'Sequence of Total', true, validateSequence, 'Format must be n/n and sequence <= total.'),
  createRule('20', 'Documentary Credit Number', true, validateT26, 'Must be 1-16 chars and not violate T26.'),
  createRule('21', 'Related Reference', true, validateT26, 'Must be 1-16 chars and not violate T26.'),
  createRule('45B', 'Description of Goods and/or Services Continuation', false, multiline(100, 50), 'Exceeds max length.'),
];

const mt707Rules: Rule[] = [
    createRule('20', "Sender's Reference", true, validateT26, "Must be 1-16 chars, no slashes."),
    createRule('21', "Receiver's Reference", true, validateT26, "Must be 1-16 chars, no slashes."),
    createRule('31C', 'Date of Original Message', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('30', 'Date of Amendment', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('26E', 'Number of Amendment', false, multiline(1, 35), 'Exceeds max length.'),
    createRule('59', 'Beneficiary (before this amendment)', false, multiline(4, 35), 'Exceeds max length.'),
    createRule('32B', 'Increase of Documentary Credit Amount', false, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('34B', 'New Documentary Credit Amount After Amendment', false, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('79', 'Narrative', false, multiline(35, 50), 'Exceeds max length.'),
];

const mt710Rules: Rule[] = [
    createRule('20', "Sender's Reference", true, validateT26, "Must be 1-16 chars, no slashes."),
    createRule('21', "Related Reference", true, validateT26, "Must be 1-16 chars, no slashes."),
    createRule('31C', 'Date of Issue', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('31D', 'Date and Place of Expiry', true, /^\d{6}.{1,29}$/m, 'Must be YYMMDD date followed by a place.'),
    createRule('50', 'Applicant', true, multiline(4, 35), 'Exceeds max length.'),
    createRule('59', 'Beneficiary', true, multiline(4, 35), 'Exceeds max length.'),
    createRule('32B', 'Currency Code, Amount', true, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('72', "Sender to Receiver Information", false, multiline(35, 50), 'Exceeds max length.'),
];

const mt720Rules: Rule[] = [
    createRule('20', "Transferring Bank's Reference", true, validateT26, "Must be 1-16 chars, no slashes."),
    createRule('21', 'Related Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('31C', 'Date of Transfer', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('40F', 'Applicable Rules', true, narrative(), 'Field is mandatory.'),
    createRule('32B', 'Amount Transferred', true, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('59', 'Transferee', true, multiline(4, 35), 'Exceeds max length.'),
    createRule('72', "Sender to Receiver Information", false, multiline(35, 50), 'Exceeds max length.'),
];

const mt730Rules: Rule[] = [
    createRule('20', "Acknowledging Bank's Reference", true, validateT26, "Must be 1-16 chars, no slashes."),
    createRule('21', "Issuing Bank's Reference", true, validateT26, "Must be 1-16 chars, no slashes."),
    createRule('30', 'Date of Acknowledgment', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('32B', 'Amount of Credit', true, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('71B', 'Charges Claimed', false, multiline(6, 35), 'Exceeds max length.'),
    createRule('72', "Sender to Receiver Information", false, multiline(35, 50), 'Exceeds max length.'),
];

const mt732Rules: Rule[] = [
    createRule('20', 'Advice Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('21', 'Your Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('32A', 'Date and Amount of Discharge', true, dateYYMMDDAmount(), 'Must be YYMMDDCurrencyAmount.'),
    createRule('53A', 'Sender\'s Correspondent', false, bic(), 'Must be a valid BIC.'),
    createRule('72', 'Sender to Receiver Information', false, multiline(35, 50), 'Exceeds max length.'),
];

const mt740Rules: Rule[] = [
    createRule('20', 'Authorization to Reimburse Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('31D', 'Expiry Date', true, /^\d{6}.{1,29}$/m, 'Must be YYMMDD date followed by a place.'),
    createRule('40B', 'Form of Reimbursement', true, /^(IRREVOCABLE|REVOCABLE)$/im, 'Invalid codeword.'),
    createRule('41A', 'Reimbursing Bank', true, bic(), 'Must be a valid BIC.'),
    createRule('42A', 'Reimbursement Under', false, bic(), 'Must be a valid BIC.'),
    createRule('32B', 'Amount', true, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('71B', 'Charges', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt742Rules: Rule[] = [
    createRule('20', 'Claim Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('21', 'DC Number', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('32B', 'Amount Claimed', true, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('53A', 'Claiming Bank\'s Correspondent', false, bic(), 'Must be a valid BIC.'),
    createRule('71B', 'Charges', false, multiline(6, 35), 'Exceeds max length.'),
];

const mt747Rules: Rule[] = [
    createRule('20', 'Amendment Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('21', 'Original Authorization Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('30', 'Date of Amendment', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('33B', 'New Amount', false, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('72', 'Details of Amendment', false, multiline(35, 50), 'Exceeds max length.'),
];

const mt750Rules: Rule[] = [
    createRule('20', 'Discrepancy Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('21', 'DC Number', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('32B', 'Amount Presented', true, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('77J', 'Discrepancies', true, multiline(100, 50), 'Exceeds max length.'),
];

const mt752Rules: Rule[] = [
    createRule('20', 'Authorization to Pay/Accept/Negotiate Ref', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('21', 'DC Number', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('32B', 'Amount', true, currencyAndAmount(), 'Invalid currency code or amount format.'),
    createRule('53A', 'Reimbursing Bank', false, bic(), 'Must be a valid BIC.'),
    createRule('72', 'Narrative', true, multiline(35, 50), 'Exceeds max length.'),
];

const mt760Rules: Rule[] = [
    createRule('27', 'Sequence of Total', true, validateSequence, 'Format must be n/n.'),
    createRule('22A', 'Purpose of Message', true, /^(ISSUE|ADVISE)$/im, 'Must be ISSUE or ADVISE.'),
    createRule('20', 'Guarantee Number', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('30', 'Date', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('40C', 'Applicable Rules', true, narrative(), 'Field is mandatory.'),
    createRule('22D', 'Form of Undertaking', true, /^(ADVI|ISGN|STAN)$/im, 'Invalid codeword.'),
    createRule('52A', 'Issuer', false, bic(), 'Must be a valid BIC.'),
    createRule('59', 'Beneficiary', true, multiline(4, 35), 'Exceeds max length.'),
    createRule('77C', 'Details of Guarantee', true, multiline(100, 50), 'Exceeds max length.'),
];

const mt767Rules: Rule[] = [
    createRule('20', 'Amendment Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('21', 'Guarantee Number', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('30', 'Date of Amendment', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('23', 'Amendment Details', true, narrative(), 'Field is mandatory.'),
    createRule('77C', 'Further Details', false, multiline(100, 50), 'Exceeds max length.'),
];

const mt768Rules: Rule[] = [
    createRule('20', 'Acknowledgment Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('21', 'Guarantee Number', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('30', 'Date of Acknowledgment', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('77C', 'Narrative', true, multiline(100, 50), 'Exceeds max length.'),
];

const mt769Rules: Rule[] = [
    createRule('20', 'Reduction/Release Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('21', 'Guarantee Number', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('30', 'Date', true, dateYYMMDD(), 'Must be a valid date in YYMMDD format.'),
    createRule('39C', 'Details of Reduction', true, narrative(), 'Field is mandatory.'),
    createRule('77C', 'Further Details', false, multiline(100, 50), 'Exceeds max length.'),
];

const mt799Rules: Rule[] = [
    createRule('20', 'Transaction Reference Number', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('21', 'Related Reference', true, validateT26, 'Must be 1-16 chars, no slashes.'),
    createRule('79', 'Narrative', true, multiline(35, 50), 'Must not exceed 35 lines of 50 characters.'),
];

const messageRules: { [key: string]: Rule[] } = {
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

// ---------- Helper: determine message type from block 2 ----------
export const getSwiftMessageType = (message: string): string | null => {
  const m = message.match(/{2:([IO])(\d{3})/i);
  if (m && m[2]) return `MT ${m[2]}`;
  return null;
};

// ---------- Main validator ----------
export const validateSwiftMessage = (message: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!message || typeof message !== 'string') {
    return [{ field: 'Structure', message: 'Message must be a non-empty string.' }];
  }

  const normalized = message.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const block1Match = normalized.match(/\{1:(F|A|I)(\d{2})([A-Z0-9]{12})(\d{10})\}/i);
  if (block1Match && /^0+$/.test(block1Match[4])) {
    errors.push({ field: '{1:}', message: 'Block 1 session/sequence number must not be all zeros.' });
  }

  const block4Match = normalized.match(/{4:\s*([\s\S]*?)-}/);
  if (!block4Match) return [{ field: 'Structure', message: 'Block 4 ({4:...}) is missing or malformed.' }];

  // --- NEW ROBUST PARSING LOGIC ---
  const block4Content = block4Match[1];
  const fieldsMap = new Map<string, string>();
  const fieldRegex = /:([0-9]{2}[A-Z]?):([\s\S]*?)(?=\n:[0-9]{2}[A-Z]?:|$)/g;
  let match;
  while ((match = fieldRegex.exec(block4Content)) !== null) {
      const tag = match[1].toUpperCase();
      const value = match[2].trim();
      fieldsMap.set(tag, value);
  }

  const getFieldValue = (tag: string): string | undefined => {
    return fieldsMap.get(tag.toUpperCase());
  }
  // --- END OF NEW LOGIC ---

  const messageType = getSwiftMessageType(normalized);
  const rules = messageType ? messageRules[messageType] : undefined;
  if (!rules) return [{ field: 'Validator', message: `No validation rules defined for ${messageType || 'unknown message type'}.` }];

  rules.forEach(rule => {
    if (rule.mandatory) {
      const present = fieldsMap.has(rule.field);
      if (!present) {
        if (rule.optionalAlternative) {
          const altPresent = fieldsMap.has(rule.optionalAlternative);
          if (!altPresent) errors.push({ field: `:${rule.field}: / :${rule.optionalAlternative}:`, message: `Mandatory field ${rule.name} or its alternative is missing.` });
        } else {
          errors.push({ field: `:${rule.field}:`, message: `Mandatory field ${rule.name} is missing.` });
        }
      }
    }
  });

  fieldsMap.forEach((value, tag) => {
    const rule = rules.find(r => r.field === tag);
    if (rule) {
      if (typeof rule.validator === 'function') {
        const err = (rule.validator as CustomValidator)(value, getFieldValue);
        if (err) errors.push({ field: err.field || `:${tag}:`, message: `${rule.name}: ${err.message}` });
      } else {
        if (!(rule.validator as RegExp).test(value)) errors.push({ field: `:${tag}:`, message: `${rule.name}: ${rule.formatError}` });
      }
    }
  });

  return [...new Map(errors.map(item => [`${item.field}|${item.message}`, item])).values()];
};
