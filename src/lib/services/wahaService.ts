type WahaWebhook = {
  url: string;
  events: string[];
};

type StartSessionResponse = {
  name?: string;
  status?: string;
  qrcode?: string;
  qr?: string;
};

type SessionStatusResponse = {
  name?: string;
  status?: string;
  qrcode?: string;
};

function getBaseUrl() {
  const base = process.env.WAHA_SERVER_URL;
  if (!base) {
    throw new Error('WAHA_SERVER_URL is not set');
  }
  return base.replace(/\/+$/, '');
}

function getHeaders(extra?: Record<string, string>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra ?? {}),
  };
  const apiKey = process.env.WAHA_API_KEY;
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }
  return headers;
}

async function requestJson<T>(path: string, init: RequestInit) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}${path}`, init);
  const text = await res.text();
  const json = text ? (JSON.parse(text) as T) : ({} as T);
  if (!res.ok) {
    const errorField = (json as unknown as { error?: unknown }).error;
    const message = typeof errorField === 'string' ? errorField : `WAHA request failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

export const wahaService = {
  async startSession(params: { sessionName: string; webhooks: WahaWebhook[] }) {
    const data = await requestJson<StartSessionResponse>('/api/sessions/start', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: params.sessionName,
        config: {
          proxy: null,
          webhooks: params.webhooks,
        },
      }),
    });
    return {
      status: data.status ?? null,
      qrUrl: data.qrcode ?? data.qr ?? null,
    };
  },

  async getSession(params: { sessionName: string }) {
    const data = await requestJson<SessionStatusResponse>(`/api/sessions/${encodeURIComponent(params.sessionName)}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return {
      status: data.status ?? null,
      qrUrl: data.qrcode ?? null,
    };
  },

  async stopSession(params: { sessionName: string }) {
    await requestJson<Record<string, unknown>>('/api/sessions/stop', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name: params.sessionName }),
    });
  },

  async sendText(params: { sessionName: string; chatId: string; text: string }) {
    await requestJson<Record<string, unknown>>('/api/sendText', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        session: params.sessionName,
        chatId: params.chatId,
        text: params.text,
      }),
    });
  },
};
