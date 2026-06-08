import { describe, it, expect, vi, afterEach } from "vitest";

// Keep the client off localStorage: it only needs a token getter.
vi.mock("@/lib/auth/token", () => ({ getAccessToken: () => null }));

import { getStocks, getHealth, API_BASE_URL } from "@/lib/api/client";

function fakeResponse(
  body: unknown,
  init?: { ok?: boolean; status?: number },
): Response {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    statusText: "",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("api client", () => {
  it("hits <base>/api/v1/<path> and parses JSON", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(fakeResponse({ status: "ok", checks: [], totalDuration: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await getHealth();

    expect(res.status).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/api/v1/health`);
  });

  it("builds query strings and skips empty params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await getStocks({ page: 2, pageSize: 10, search: "", sort: "price_desc" });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/market/stocks?");
    expect(url).toContain("page=2");
    expect(url).toContain("pageSize=10");
    expect(url).toContain("sort=price_desc");
    expect(url).not.toContain("search=");
  });

  it("throws an ApiError carrying the server code/message on failure", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      fakeResponse(
        { code: "TRADE_COOLDOWN", message: "Too fast" },
        { ok: false, status: 429 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getHealth()).rejects.toMatchObject({
      name: "ApiError",
      code: "TRADE_COOLDOWN",
      status: 429,
      message: "Too fast",
    });
  });
});
