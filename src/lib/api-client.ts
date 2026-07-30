export class ApiClientError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  json?: unknown;
}

export async function apiRequest<ResponseBody>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ResponseBody> {
  const headers = new Headers(options.headers);

  let body: BodyInit | undefined;
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  }

  const response = await fetch(path, {
    ...options,
    body,
    credentials: options.credentials ?? "same-origin",
    headers,
  });

  if (!response.ok) {
    const payload = await parseResponsePayload(response);
    throw new ApiClientError(response.statusText, response.status, payload);
  }

  if (response.status === 204) {
    return null as ResponseBody;
  }

  return (await parseResponsePayload(response)) as ResponseBody;
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}
