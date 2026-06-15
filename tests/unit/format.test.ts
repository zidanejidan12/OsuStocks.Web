import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatChange,
  formatPercent,
  formatCompact,
  formatRelativeTime,
  formatDate,
  formatDateTime,
} from "@/lib/format";

describe("format", () => {
  it("formatCurrency keeps two decimals with grouping", () => {
    expect(formatCurrency(1234.5)).toBe("1,234.50");
    expect(formatCurrency(0)).toBe("0.00");
  });

  it("formatNumber groups integers", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("formatChange prefixes a sign", () => {
    expect(formatChange(12.3)).toBe("+12.30");
    expect(formatChange(-12.3)).toBe("-12.30");
  });

  it("formatPercent scales a fraction to a percent", () => {
    expect(formatPercent(0.124)).toBe("12.4%");
    expect(formatPercent(0.05, true)).toBe("+5.0%");
    expect(formatPercent(-0.05, true)).toBe("-5.0%");
  });

  it("formatCompact abbreviates large numbers", () => {
    expect(formatCompact(1200)).toBe("1.2K");
    expect(formatCompact(3_400_000)).toBe("3.4M");
  });

  it("formatRelativeTime buckets recent timestamps", () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe("just now");
    expect(
      formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000).toISOString()),
    ).toBe("5m ago");
    expect(
      formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()),
    ).toBe("2h ago");
  });

  it("date helpers pass through empty / invalid input", () => {
    expect(formatDate("")).toBe("");
    expect(formatDateTime("")).toBe("");
    expect(formatRelativeTime("not-a-date")).toBe("not-a-date");
  });
});
