import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function unauthorized(message = "Unauthorized") {
  return new ApiError(401, message, "UNAUTHORIZED");
}

export function forbidden(message = "Forbidden") {
  return new ApiError(403, message, "FORBIDDEN");
}

export function notFound(message = "Not found") {
  return new ApiError(404, message, "NOT_FOUND");
}

export function badRequest(message = "Bad request") {
  return new ApiError(400, message, "BAD_REQUEST");
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function withApi<T>(handler: () => Promise<T>) {
  try {
    return await handler();
  } catch (error) {
    return toErrorResponse(error);
  }
}
