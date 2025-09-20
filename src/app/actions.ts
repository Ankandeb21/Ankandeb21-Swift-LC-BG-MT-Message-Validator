'use server';

import { generateFixSuggestions } from '@/ai/flows/generate-fix-suggestions';
import { validateSwiftMessage, type ValidationError } from '@/lib/swift-validator';

interface ValidationSuccess {
  status: 'valid';
}

interface ValidationInvalid {
  status: 'invalid';
  errors: ValidationError[];
  suggestions: string[];
}

interface ValidationErrorResponse {
  status: 'error';
  message: string;
}

export type ValidationResult = ValidationSuccess | ValidationInvalid | ValidationErrorResponse;

export async function validateMessageAction(
  prevState: any,
  formData: FormData
): Promise<ValidationResult> {
  const message = formData.get('message') as string;

  if (!message || message.trim().length === 0) {
    // We don't return an error state, just clear the results.
    return { status: 'error', message: ''};
  }

  const validationErrors = validateSwiftMessage(message);

  if (validationErrors.length === 0) {
    return { status: 'valid' };
  }

  try {
    const aiSuggestions = await generateFixSuggestions({
      message,
      errors: validationErrors.map(e => `${e.field}: ${e.message}`),
    });

    return {
      status: 'invalid',
      errors: validationErrors,
      suggestions: aiSuggestions.suggestions,
    };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    // Return errors even if AI fails
    return {
      status: 'invalid',
      errors: validationErrors,
      suggestions: ['AI-powered suggestions are currently unavailable. Please check the validation errors manually.'],
    };
  }
}
