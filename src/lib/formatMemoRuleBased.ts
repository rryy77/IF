/** ひらがな → 正式名称 */
const HIRAGANA_TO_TERM: [RegExp, string][] = [
  [/ほーむるーむ|ほーむるむ/gi, "ホームルーム"],
  [/\bHR\b/gi, "ホームルーム"],
  [/ほーむ/gi, "ホームルーム"],
  [/せかいし/g, "世界史"],
  [/にほんし/g, "日本史"],
  [/げんだいぶん/g, "現代文"],
  [/こてん/g, "古典"],
  [/こくご/g, "国語"],
  [/すうがく/g, "数学"],
  [/さんすう/g, "算数"],
  [/えいご/g, "英語"],
  [/りか/g, "理科"],
  [/しゃかい/g, "社会"],
  [/ぶつり/g, "物理"],
  [/かがく/g, "化学"],
  [/せいぶつ/g, "生物"],
  [/ちり/g, "地理"],
];

/** 連結テキストから longest-match で切り出す用語（長い順） */
const KNOWN_TERMS = [
  "ホームルーム",
  "世界史",
  "日本史",
  "現代文",
  "持ち物",
  "古典",
  "国語",
  "数学",
  "算数",
  "英語",
  "理科",
  "社会",
  "物理",
  "化学",
  "生物",
  "地理",
].sort((a, b) => b.length - a.length);

const FILLER_PATTERNS: RegExp[] = [
  /があります/g,
  /があると思います/g,
  /だと思います/g,
  /かもしれません/g,
  /忘れないように/g,
  /忘れない/g,
  /ということです/g,
  /たぶん/g,
  /でしょう/g,
  /ください/g,
];

const DATE_IN_TEXT =
  /(\d{1,2})\s*(?:\/|月|がつ)\s*(\d{1,2})\s*日?/gi;

function toHalfWidth(text: string): string {
  return text
    .replace(/[０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    )
    .replace(/[／]/g, "/");
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\u3000/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function applyHiraganaReplacements(text: string): string {
  let result = text;
  for (const [pattern, value] of HIRAGANA_TO_TERM) {
    result = result.replace(pattern, value);
  }
  return result;
}

function removeFillers(text: string): string {
  let result = text;
  for (const pattern of FILLER_PATTERNS) {
    result = result.replace(pattern, "");
  }
  return result
    .replace(/[。．.!！?？]/g, " ")
    .replace(/\s*です\s*/g, " ")
    .replace(/\s*ます\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 文中の日付表記をすべて M/D に統一 */
export function normalizeDatesInText(text: string): string {
  let s = toHalfWidth(text);
  s = s.replace(
    /(\d{1,2})\s*(?:月|がつ)\s*(\d{1,2})\s*日?/gi,
    (_, month, day) => `${Number(month)}/${Number(day)}`
  );
  s = s.replace(
    /(\d{1,2})\s*\/\s*(\d{1,2})/g,
    (_, month, day) => `${Number(month)}/${Number(day)}`
  );
  return s;
}

function splitByDateSegments(text: string): string[] {
  const normalized = normalizeDatesInText(text);
  const dateRegex = /\d{1,2}\/\d{1,2}/g;
  const matches = [...normalized.matchAll(dateRegex)];

  if (matches.length === 0) {
    const line = normalized.trim();
    return line ? [line] : [];
  }

  const segments: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end =
      i + 1 < matches.length ? matches[i + 1].index! : normalized.length;
    segments.push(normalized.slice(start, end).trim());
  }
  return segments;
}

function splitKnownTerms(text: string): string[] {
  const normalized = applyHiraganaReplacements(text.replace(/\s+/g, ""));
  const tokens: string[] = [];
  let i = 0;

  while (i < normalized.length) {
    let matched = false;
    for (const term of KNOWN_TERMS) {
      if (normalized.startsWith(term, i)) {
        tokens.push(term);
        i += term.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      let j = i + 1;
      while (j <= normalized.length) {
        const tail = normalized.slice(j);
        if (KNOWN_TERMS.some((t) => tail.startsWith(t))) break;
        j++;
      }
      const word = normalized.slice(i, j);
      if (word) tokens.push(word);
      i = j;
    }
  }
  return tokens;
}

function tokenizeBody(body: string): string[] {
  const cleaned = applyHiraganaReplacements(
    removeFillers(body).replace(/^(は|が|に|の|を)\s*/, "")
  );

  if (!cleaned) return [];

  const groupMatch = cleaned.match(/^(\d+組)(?:は|が)?\s*(.+)$/);
  if (groupMatch) {
    return [`${groupMatch[1]}：${groupMatch[2].trim()}`];
  }

  const belongingsMatch = cleaned.match(/^持ち物[：:]?\s*(.+)$/i);
  if (belongingsMatch) {
    return [`持ち物：${belongingsMatch[1].trim()}`];
  }

  const withDots = cleaned.replace(/[とや、,&]/g, "・");
  const rawParts = withDots
    .split(/[・\s]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const expanded: string[] = [];
  for (const part of rawParts) {
    if (KNOWN_TERMS.some((t) => part === t || part.includes(t))) {
      if (part.length <= 6 && KNOWN_TERMS.includes(part)) {
        expanded.push(part);
      } else {
        expanded.push(...splitKnownTerms(part));
      }
    } else if (part.length >= 4 && !part.includes("：")) {
      const split = splitKnownTerms(part);
      expanded.push(...(split.length > 0 ? split : [part]));
    } else {
      expanded.push(part);
    }
  }

  return expanded;
}

function formatDateSegment(segment: string): string {
  const dateMatch = segment.match(/^(\d{1,2}\/\d{1,2})\s*([\s\S]*)$/);
  if (!dateMatch) {
    const tokens = tokenizeBody(segment);
    return tokens.length > 0 ? tokens.join("・") : segment.trim();
  }

  const date = dateMatch[1];
  const rest = dateMatch[2].trim();
  if (!rest) return date;

  const tokens = tokenizeBody(rest);
  if (tokens.length === 0) return date;

  const body =
    tokens.length === 1 && tokens[0].includes("：")
      ? tokens[0]
      : tokens.join("・");

  return `${date}　${body}`;
}

/**
 * ルールベースでメモを整形（日付分割・教科正規化・短文化）
 */
export function formatMemoRuleBased(memo: string): string {
  const input = memo.trim();
  if (!input) return "";

  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const outputLines: string[] = [];

  for (const rawLine of lines) {
    const line = normalizeWhitespace(removeFillers(rawLine));
    if (!line) continue;

    const segments = splitByDateSegments(line);
    for (const segment of segments) {
      const formatted = formatDateSegment(segment);
      if (formatted) outputLines.push(formatted);
    }
  }

  return outputLines.join("\n");
}
