import { config } from 'dotenv';
config();

import '@/ai/flows/generate-fix-suggestions.ts';
import '@/ai/flows/summarize-validation-errors.ts';