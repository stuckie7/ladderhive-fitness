
/**
 * Helper functions to convert form data to proper types for exercise forms
 */

/**
 * Ensures a value is converted to a number
 * @param value - The value to convert to number
 * @param defaultValue - Optional default value if conversion results in NaN
 */
export const ensureNumber = (value: string | number | undefined, defaultValue = 0): number => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Converts form data fields to their proper types for the exercise form
 * @param formData - The form data object
 */
export const convertExerciseFormFields = (formData: Record<string, any>) => {
  return {
    ...formData,
    // Convert number fields
    recommended_reps: ensureNumber(formData.recommended_reps),
    recommended_sets: ensureNumber(formData.recommended_sets), 
    rest_time: ensureNumber(formData.rest_time),
    // Add any other number fields that need conversion
  };
};
