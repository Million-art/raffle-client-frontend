import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError, getErrorMessage } from "./api";

describe("ApiError", () => {
  it("creates error with message and status", () => {
    const err = new ApiError("Not found", 404, "NOT_FOUND");
    expect(err.message).toBe("Not found");
    expect(err.status).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.name).toBe("ApiError");
  });
});

describe("getErrorMessage", () => {
  it("returns ApiError message", () => {
    expect(getErrorMessage(new ApiError("Custom", 400))).toBe("Custom");
  });

  it("returns Error message", () => {
    expect(getErrorMessage(new Error("Standard"))).toBe("Standard");
  });

  it("returns fallback for unknown", () => {
    expect(getErrorMessage(null)).toBe("An unexpected error occurred");
    expect(getErrorMessage(undefined)).toBe("An unexpected error occurred");
    expect(getErrorMessage("string")).toBe("An unexpected error occurred");
  });
});
