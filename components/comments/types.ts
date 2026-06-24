export type RawComment = {
  id: string;
  userId: string;
  body?: { version: number; content: unknown[] };
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  reactions: unknown[];
};

export type RawThread = {
  id: string;
  createdAt: number;
  updatedAt: number;
  resolved: boolean;
  comments: RawComment[];
};

export type UserInfo = {
  id: string;
  username: string;
  avatarUrl: string;
};

export function extractText(body?: { version: number; content: unknown[] }): string {
  if (!body?.content) return "";
  const parts: string[] = [];
  function walk(nodes: unknown[]) {
    for (const node of nodes as Array<{ type?: string; text?: string; content?: unknown[] }>) {
      if (node.type === "text" && typeof node.text === "string") parts.push(node.text);
      else if (node.content) walk(node.content);
    }
  }
  walk(body.content);
  return parts.join("").trim();
}

export function makeBody(text: string) {
  return {
    version: 1,
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

export function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}
