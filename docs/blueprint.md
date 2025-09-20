# **App Name**: SWIFT Validator

## Core Features:

- Message Validation: Accept a SWIFT MT messages as input, including MT700.
- Real-time Validation: Validate SWIFT MT messages against syntax and mandatory field rules using regex.
- Error Reporting: Provide clear, actionable error messages for invalid messages. Generate potential fixes to the code as a suggestion, after reviewing the errors. This process uses the LLM as a tool to refine and suggest alternative phrasings for each validation suggestion. The system itself will evaluate all rule breaches to output its assessment.
- Validation Result Display: Display validation results in a clear and concise format.

## Style Guidelines:

- Primary color: Deep sky blue (#3498db) for a clean and professional feel, suggestive of trust and efficiency.
- Background color: Light gray (#ecf0f1) for a neutral and unobtrusive backdrop.
- Accent color: Soft orange (#e67e22) to draw attention to key actions like the 'Validate' button and important alerts.
- Font: 'Inter', a sans-serif for clear readability and a modern look.
- Simple and clean layout with clear separation of input and output areas.
- Use simple, recognizable icons to indicate the validation status (e.g., a checkmark for valid, an 'X' for invalid).
- Subtle animations for validation feedback to enhance the user experience.