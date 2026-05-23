/** Gmail 検索クエリ（環境変数で上書き可能） */
export function getGmailSearchQuery(): string {
  return (
    process.env.GMAIL_SEARCH_QUERY?.trim() ||
    "subject:(さくら連絡網 OR 学校連絡 OR 連絡網)"
  );
}

export const GMAIL_READONLY_SCOPE =
  "https://www.googleapis.com/auth/gmail.readonly";

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
 * 必ず GOOGLE_REDIRECT_URI のみを使用（localhost フォールバックなし）
 */
export function getGoogleRedirectUri(): string {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (!redirectUri) {
    throw new OAuthConfigError(
      "GOOGLE_REDIRECT_URI is missing",
      "GOOGLE_REDIRECT_URI is missing"
    );
  }
  return redirectUri;
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
  if (!process.env.GOOGLE_REDIRECT_URI?.trim()) {
    missing.push("GOOGLE_REDIRECT_URI");
  }
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
