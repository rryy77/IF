import { formatMemoRuleBased } from "./formatMemoRuleBased";

/**
 * メモを読みやすい形に整形する
 */
export async function formatMemoWithAI(input: string): Promise<string> {
  // TODO: Replace rule-based formatter with real AI API later.
  await Promise.resolve();
  return formatMemoRuleBased(input);
}
