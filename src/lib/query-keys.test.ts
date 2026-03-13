import { describe, it, expect } from "vitest";
import { queryKeys } from "./query-keys";

describe("queryKeys", () => {
  it("has consistent structure for raffles", () => {
    expect(queryKeys.raffles.list({ page: 1, limit: 20 })).toEqual([
      "client",
      "raffles",
      "list",
      { page: 1, limit: 20 },
    ]);
  });

  it("raffle detail key includes id", () => {
    expect(queryKeys.raffles.detail("abc-123")).toEqual([
      "client",
      "raffles",
      "detail",
      "abc-123",
    ]);
  });

  it("me.raffles key includes filters", () => {
    expect(queryKeys.me.raffles({ status: "active" })).toEqual([
      "client",
      "me",
      "raffles",
      { status: "active" },
    ]);
  });

  it("notifications keys are nested correctly", () => {
    expect(queryKeys.notifications.unreadCount()).toEqual([
      "client",
      "notifications",
      "unread-count",
    ]);
  });
});
