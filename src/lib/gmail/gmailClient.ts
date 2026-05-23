import { getGmailSearchQuery } from "./config";
import {
  extractBodyFromPayload,
  getHeader,
  type GmailPart,
} from "./parseMessage";
import { getGmailToken, saveGmailToken } from "./tokenStore";
import { refreshAccessToken } from "./oauth";

export type ParsedGmailMessage = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  receivedAt: string;
  snippet: string;
  plainText: string;
  htmlText: string;
  body: string;
};

async function getValidAccessToken(): Promise<string> {
  const row = await getGmailToken();
  if (!row) {
    throw new Error("Gmailが連携されていません。通知画面から連携してください。");
  }

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  const needsRefresh = expiresAt > 0 && expiresAt < Date.now() + 60_000;

  if (needsRefresh && row.refresh_token) {
    const refreshed = await refreshAccessToken(row.refresh_token);
    await saveGmailToken({
      accessToken: refreshed.accessToken,
      refreshToken: row.refresh_token,
      expiresAt: refreshed.expiresAt,
      userEmail: row.user_email,
    });
    return refreshed.accessToken;
  }

  return row.access_token;
}

async function gmailFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  const json = await res.json();
  if (!res.ok) {
    const err = json as { error?: { message?: string } };
    throw new Error(
      err.error?.message || `Gmail API error (${res.status})`
    );
  }
  return json as T;
}

export async function listSakuraMessageIds(
  maxResults = 20
): Promise<string[]> {
  const accessToken = await getValidAccessToken();
  const q = encodeURIComponent(getGmailSearchQuery());

  const data = await gmailFetch<{
    messages?: { id: string }[];
  }>(
    `/users/me/messages?q=${q}&maxResults=${maxResults}`,
    accessToken
  );

  return (data.messages ?? []).map((m) => m.id);
}

export async function fetchGmailMessage(
  messageId: string
): Promise<ParsedGmailMessage> {
  const accessToken = await getValidAccessToken();

  const data = await gmailFetch<{
    id: string;
    threadId: string;
    snippet: string;
    internalDate?: string;
    payload?: GmailPart & {
      headers?: { name: string; value: string }[];
    };
  }>(`/users/me/messages/${messageId}?format=full`, accessToken);

  const headers = data.payload?.headers;
  const { plainText, htmlText, bodyForAnalysis } = extractBodyFromPayload(
    data.payload ?? {}
  );

  const receivedAt = data.internalDate
    ? new Date(Number(data.internalDate)).toISOString()
    : new Date().toISOString();

  return {
    id: data.id,
    threadId: data.threadId,
    subject: getHeader(headers, "Subject"),
    from: getHeader(headers, "From"),
    receivedAt,
    snippet: data.snippet ?? "",
    plainText,
    htmlText,
    body: bodyForAnalysis || data.snippet || "",
  };
}
