export type ApiRoutes = {
  usersCreate: string // e.g. /users
  usersGetById: string // e.g. /users/:id
  usersDelete: string // e.g. /users/:id
  messagesCreate: string // e.g. /messages
  messagesBetween: string // e.g. /messages/by-user
  conversationsByUser: string // e.g. /conversations/:id
}

export const defaultRoutes: ApiRoutes = {
  usersCreate: "/users",
  usersGetById: "/users/:id",
  usersDelete: "/users/:id",
  messagesCreate: "/messages",
  messagesBetween: "/messages/by-user",
  conversationsByUser: "/conversations/:id",
}

export function expandPath(path: string, params?: Record<string, string | number>) {
  if (!params) return path
  return Object.entries(params).reduce((acc, [k, v]) => {
    return acc.replace(new RegExp(`:${k}\\b`, "g"), encodeURIComponent(String(v)))
  }, path)
}

export async function apiRequest<T = unknown>(
  baseUrl: string,
  options: {
    method: "GET" | "POST" | "DELETE"
    path: string
    params?: Record<string, string | number>
    body?: any
    headers?: Record<string, string>
  },
) {
  const url = `${baseUrl.replace(/\/+$/, "")}${expandPath(options.path, options.params)}`
  const isJson = options.body !== undefined
  const res = await fetch(url, {
    method: options.method,
    headers: {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    body: isJson ? JSON.stringify(options.body) : undefined,
  })
  const contentType = res.headers.get("content-type") || ""
  const data = contentType.includes("application/json") ? await res.json() : await res.text()
  return { ok: res.ok, status: res.status, data }
}
