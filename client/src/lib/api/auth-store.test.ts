import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isRefreshExpired,
} from "./auth-store";

describe("auth-store", () => {
  beforeEach(() => {
    localStorage.clear();
    clearTokens(false);
  });

  it("stores and retrieves access and refresh tokens", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();

    setTokens(
      {
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
      },
      false
    );

    expect(getAccessToken()).toBe("access-token-123");
    expect(getRefreshToken()).toBe("refresh-token-456");
  });

  it("clears tokens correctly", () => {
    setTokens(
      {
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
      },
      false
    );

    clearTokens(false);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("detects expired refresh token timestamps", () => {
    const pastDate = new Date(Date.now() - 60_000).toISOString();
    setTokens(
      {
        accessToken: "token",
        refreshToken: "refresh",
        refreshTokenExpiresAt: pastDate,
      },
      false
    );

    expect(isRefreshExpired()).toBe(true);

    const futureDate = new Date(Date.now() + 60_000).toISOString();
    setTokens(
      {
        accessToken: "token",
        refreshToken: "refresh",
        refreshTokenExpiresAt: futureDate,
      },
      false
    );

    expect(isRefreshExpired()).toBe(false);
  });
});
