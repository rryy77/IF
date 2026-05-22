/** 日本時間（Asia/Tokyo）で明日の YYYY-MM-DD */
export function getTomorrowInJapanDateString(): string {
  const now = new Date();
  const japanNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  japanNow.setDate(japanNow.getDate() + 1);

  const yyyy = japanNow.getFullYear();
  const mm = String(japanNow.getMonth() + 1).padStart(2, "0");
  const dd = String(japanNow.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function formatShortDateJa(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
}
