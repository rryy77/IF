export type EventRow = {
  id: string;
  title: string;
  date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  type: string;
  status: string;
  source: string;
  raw_text: string | null;
  confidence: number | null;
  description: string | null;
  reminder_sent_at: string | null;
  created_at: string;
};

export type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type NoticeRow = {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  category: string;
  importance: string;
  source: string;
  pdf_url: string | null;
  should_notify: boolean;
  should_create_event: boolean;
  is_read: boolean;
  created_at: string;
};

export type ProcessedMailIdRow = {
  id: string;
  mail_id: string;
  processed_at: string;
};
