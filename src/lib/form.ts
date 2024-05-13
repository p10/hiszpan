import type { ZodIssue } from 'zod';

export type Fields = Record<
  string,
  {
    value: string;
    error?: string;
  }
>;

export function formFields(
  input: Record<string, FormDataEntryValue | null>,
  issues: ZodIssue[],
  options: { empty?: boolean } = {},
): Fields {
  const { empty } = { ...{ empty: false }, ...options };
  return Object.keys(input).reduce<Fields>((acc, key) => {
    const issue = issues.find((issue) => issue.path[0] === key);
    return {
      ...acc,
      [key]: {
        value: empty ? '' : input[key]?.toString() ?? '',
        error: issue ? issue.message : undefined,
      },
    };
  }, {});
}