import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { request } from "./http";
import { setTokens, clearTokens } from "./auth-store";
import { ApiError } from "./errors";

describe("http transport", () => {
  beforeEach(() => {
    localStorage.clear();
    clearTokens(false);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches Bearer token to authenticated requests", async () => {
    setTokens({ accessToken: "valid-jwt", refreshToken: "refresh-jwt" }, false);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: { message: "ok" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await request<{ message: string }>("/api/admin/metrics");

    expect(fetchMock).toHaveBeenCalled();
    const [calledUrl, calledOptions] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe("/api/admin/metrics");
    expect(calledOptions.headers.Authorization).toBe("Bearer valid-jwt");
    expect(result).toEqual({ message: "ok" });
  });

  it("omits Authorization header for anonymous requests", async () => {
    setTokens({ accessToken: "valid-jwt", refreshToken: "refresh-jwt" }, false);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: { token: "new" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await request("/api/auth/login", {
      method: "POST",
      anonymous: true,
      body: { email: "admin@styly.tn", password: "pwd" },
    });

    const [, calledOptions] = fetchMock.mock.calls[0];
    expect(calledOptions.headers.Authorization).toBeUndefined();
  });

  it("normalizes API error responses into ApiError instances", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () =>
        JSON.stringify({
          error: "Forbidden",
          message: "You lack the 'orders' permission",
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(request("/api/admin/orders")).rejects.toThrow(ApiError);
  });
});
