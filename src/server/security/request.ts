const jsonContentTypes = ["application/json", "application/problem+json"];

export class RequestValidationError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "RequestValidationError";
    this.status = status;
    this.code = code;
  }
}

interface ReadJsonBodyOptions {
  maxBytes: number;
}

export async function readJsonBody(
  request: Request,
  options: ReadJsonBodyOptions,
): Promise<unknown> {
  assertJsonContentType(request);
  assertContentLength(request, options.maxBytes);

  const rawBody = await request.text();
  const actualBytes = new TextEncoder().encode(rawBody).byteLength;

  if (actualBytes > options.maxBytes) {
    throw new RequestValidationError(
      "Request body is too large.",
      413,
      "PAYLOAD_TOO_LARGE",
    );
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new RequestValidationError(
      "Request body must be valid JSON.",
      400,
      "INVALID_JSON",
    );
  }
}

function assertJsonContentType(request: Request): void {
  const contentType = request.headers.get("content-type") ?? "";
  const isJson = jsonContentTypes.some((allowedType) =>
    contentType.toLowerCase().includes(allowedType),
  );

  if (!isJson) {
    throw new RequestValidationError(
      "Content-Type must be application/json.",
      415,
      "UNSUPPORTED_MEDIA_TYPE",
    );
  }
}

function assertContentLength(request: Request, maxBytes: number): void {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) return;

  const contentLengthBytes = Number.parseInt(contentLength, 10);

  if (Number.isNaN(contentLengthBytes)) return;

  if (contentLengthBytes > maxBytes) {
    throw new RequestValidationError(
      "Request body is too large.",
      413,
      "PAYLOAD_TOO_LARGE",
    );
  }
}
