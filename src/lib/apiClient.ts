const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

if (!BASE_URL && import.meta.env.DEV) {
  console.warn(
    '[apiClient] VITE_API_BASE_URL is not set. ' +
      'Copy .env.example to .env.local and set your Java backend URL.',
  )
}

/** Structured error thrown for non-2xx responses. */
export class ApiError extends Error {
  readonly status: number
  readonly statusText: string

  constructor(status: number, statusText: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    // Try to extract a message from the response body (Spring Boot error format).
    let message = response.statusText
    try {
      const errorBody = (await response.json()) as { message?: string }
      if (errorBody.message) message = errorBody.message
    } catch {
      // Response body was not JSON — keep statusText.
    }
    throw new ApiError(response.status, response.statusText, message)
  }

  // 204 No Content or empty body — return undefined cast to T.
  const contentType = response.headers.get('Content-Type') ?? ''
  if (response.status === 204 || !contentType.includes('application/json')) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'POST', body, ...options }),

  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body, ...options }),

  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', body, ...options }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),
}
