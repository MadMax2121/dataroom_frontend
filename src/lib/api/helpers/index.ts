/**
 * Removes empty properties (null, undefined, empty string) from an object
 * This is useful for constructing query parameters
 */
export const removeEmptyProps = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  });
  
  return result;
}; 