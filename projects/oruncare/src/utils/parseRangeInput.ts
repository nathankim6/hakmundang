
/**
 * Preserves the original input value exactly as entered
 * This function simply returns the original value without any modification
 * This allows users to freely enter any content without automatic conversions
 */
export const parseRangeInput = (rangeInput: string | number): string | number => {
  // Return the original input without any parsing, validation or conversion
  return rangeInput;
};
