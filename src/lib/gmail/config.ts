/** Gmail 検索クエリ（環境変数で上書き可能） */
export function getGmailSearchQuery(): string {
  return (
    process.env.GMAIL_SEARCH_QUERY?.trim() ||
    "subject:(さくら連絡網 OR 学校連絡 OR 連絡網)"
  );
}

export const GMAIL_READONLY_SCOPE =
  "https://www.googleapis.com/auth/gmail.readonly";

/** 正しい Gmail OAuth コールバックパス */
export const GMAIL_OAUTH_CALLBACK_PATH = "/api/gmail/callback";

/** 旧実装のコールバックパス（互換用） */
export const LEGACY_OAUTH_CALLBACK_PATH = "/api/auth/callback/google";

/** OAuth / サイトURL の環境変数不足 */
export class OAuthConfigError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = "OAuthConfigError";
    this.code = code;
  }
}

/**
 * Google OAuth の redirect_uri（開始時・トークン交換時で同一必須）
 * NEXT_PUBLIC_SITE_URL + /api/gmail/callback を正とする。
 * GOOGLE_REDIRECT_URI が古いパスや別 URL の場合は無視して canonical を返す。
 */
export function getGoogleRedirectUri(): string {
  const canonical = `${getSiteBaseUrl()}${GMAIL_OAUTH_CALLBACK_PATH}`;
  const env = process.env.GOOGLE_REDIRECT_URI?.trim();

  if (!env) {
    return canonical;
  }

  if (
    env.includes(LEGACY_OAUTH_CALLBACK_PATH) ||
    !env.endsWith(GMAIL_OAUTH_CALLBACK_PATH)
  ) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[gmail] GOOGLE_REDIRECT_URI (${env}) is ignored; using ${canonical}. ` +
          `Update Vercel env and Google Cloud Console to match.`
      );
    }
    return canonical;
  }

  try {
    const envOrigin = new URL(env).origin;
    const canonicalOrigin = new URL(canonical).origin;
    if (envOrigin !== canonicalOrigin) {
      console.warn(
        `[gmail] GOOGLE_REDIRECT_URI host differs from site URL; using ${canonical}`
      );
      return canonical;
    }
  } catch {
    return canonical;
  }

  return env;
}

/** 旧 /api/auth/callback/google 用（レガシーコールバックの token 交換のみ） */
export function getLegacyGoogleRedirectUri(): string {
  return `${getSiteBaseUrl()}${LEGACY_OAUTH_CALLBACK_PATH}`;
}

/** OAuth 完了後の通知画面 URL（hash 付き可） */
export function getNoticesRedirectUrl(query?: string): URL {
  const base = getSiteBaseUrl();
  const path = query ? `/notices?${query}` : "/notices";
  return new URL(path, base);
}

/**
 * getSiteBaseUrl が使えないときのフォールバック（callback エラー時）
 */
export function getNoticesRedirectUrlFallback(query = "gmail=error"): URL {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    ""
  ).replace(/\/$/, "");

  if (!base) {
    return new URL(`/notices?${query}`, "http://localhost:3000");
  }
  return new URL(`/notices?${query}`, base);
}

/**
 * OAuth 完了後のリダイレクト先などサイトのベース URL
 * NEXT_PUBLIC_SITE_URL を優先、なければ NEXT_PUBLIC_APP_URL
 */
export function getSiteBaseUrl(): string {
  const url = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim()
  )?.replace(/\/$/, "");

  if (!url) {
    throw new OAuthConfigError(
      "SITE_URL is missing",
      "NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL is missing"
    );
  }

  return url;
}

/** UI / 診断用：不足している環境変数一覧（throw しない） */
export function getGmailEnvStatus(): {
  oauthReady: boolean;
  missingEnv: string[];
} {
  const missing: string[] = [];
  if (!process.env.GOOGLE_CLIENT_ID?.trim()) missing.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET?.trim()) {
    missing.push("GOOGLE_CLIENT_SECRET");
  }
  // GOOGLE_REDIRECT_URI は任意（未設定なら SITE_URL から自動生成）
  if (
    !process.env.NEXT_PUBLIC_SITE_URL?.trim() &&
    !process.env.NEXT_PUBLIC_APP_URL?.trim()
  ) {
    missing.push("NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL");
  }
  return { oauthReady: missing.length === 0, missingEnv: missing };
}

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = getGoogleRedirectUri();

  if (!clientId) {
    throw new OAuthConfigError(
      "GOOGLE_CLIENT_ID is missing",
      "GOOGLE_CLIENT_ID is missing"
    );
  }

  if (!clientSecret) {
    throw new OAuthConfigError(
      "GOOGLE_CLIENT_SECRET is missing",
      "GOOGLE_CLIENT_SECRET is missing"
    );
  }

  return { clientId, clientSecret, redirectUri };
}
