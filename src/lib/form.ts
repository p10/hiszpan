import type { ZodIssue } from 'zod';

export type Fields = Record<
  string,
  {
    value: string;
    error?: string;
  }
>;

export function fields(
  input: Record<string, FormDataEntryValue | null>,
  errorsOrIssues: Record<string, string> | ZodIssue[],
  options: { empty?: boolean } = {},
) {
  const { empty } = { empty: false, ...options };
  const errors = Array.isArray(errorsOrIssues)
    ? errorsOrIssues.reduce<Record<string, string>>((acc, error) => {
        return {
          ...acc,
          [error.path[0]]: error.message,
        };
      }, {})
    : errorsOrIssues;
  return Object.keys(input).reduce<Fields>((acc, key) => {
    return {
      ...acc,
      [key]: {
        value: empty ? '' : input[key]?.toString() ?? '',
        error: errors[key],
      },
    };
  }, {});
}
