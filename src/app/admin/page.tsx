"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GearSix,
  UsersThree,
  Plus,
  Trash,
  FloppyDisk,
  Power,
  Lock,
  ShieldWarning,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from "@phosphor-icons/react";
import {
  getMarketSettings,
  updateMarketSettings,
  getTrackedPlayers,
  addTrackedPlayer,
  updateTrackedPlayer,
  removeTrackedPlayer,
  getAdminTrades,
  getAdminWalletTransactions,
  ApiError,
} from "@/lib/api/client";
import type {
  AdminTrade,
  AdminWalletTransaction,
  MarketSettings,
  TrackedPlayer,
  TrackingTier,
  TradeType,
  WalletTransactionType,
} from "@/lib/api/types";
import { formatNumber, formatShares, formatChange, formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Money } from "@/components/ui/Money";
import { Coin } from "@/components/ui/Coin";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { fadeUp, staggerContainer, spring } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/Toast";

const TIERS: TrackingTier[] = ["Tier1", "Tier2", "Tier3"];

const WALLET_TYPES: WalletTransactionType[] = [
  "InitialGrant",
  "BuyStock",
  "SellStock",
  "DailyReward",
  "AdminGrant",
  "AdminDeduction",
  "MissionReward",
  "AchievementReward",
  "TradeFee",
];
const WALLET_TYPE_LABELS: Record<WalletTransactionType, string> = {
  InitialGrant: "Initial Grant",
  BuyStock: "Buy Stock",
  SellStock: "Sell Stock",
  DailyReward: "Daily Reward",
  AdminGrant: "Admin Grant",
  AdminDeduction: "Admin Deduction",
  MissionReward: "Mission Reward",
  AchievementReward: "Achievement Reward",
  TradeFee: "Trade Fee",
};
const WALLET_CREDIT_TYPES: ReadonlySet<WalletTransactionType> = new Set([
  "InitialGrant",
  "SellStock",
  "DailyReward",
  "AdminGrant",
  "MissionReward",
  "AchievementReward",
]);

const inputClass =
  "w-full rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-3.5 py-2.5 text-sm font-mono tabular-nums text-zinc-100 transition-all focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/30";

const filterSelectClass =
  "rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 transition-all focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/30 cursor-pointer";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden min-h-screen">
      <div className="absolute top-0 right-0 -z-10 h-[350px] w-[350px] rounded-full bg-violet-500/12 dark:bg-violet-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[350px] w-[350px] rounded-full bg-fuchsia-500/12 dark:bg-fuchsia-500/5 blur-[120px] pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {children}
      </div>
    </div>
  );
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message || fallback : fallback;
}

function DecimalField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max?: number;
  step: number;
  hint?: string;
}) {
  const [text, setText] = useState(() => String(value));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const parsed = Number(text);
    let next = Number.isFinite(parsed) ? parsed : min;
    next = Math.max(min, next);
    if (typeof max === "number") next = Math.min(max, next);
    setText(String(next));
    if (next !== value) onChange(next);
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={text}
        onFocus={() => setEditing(true)}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        className={inputClass}
      />
      {hint && <span className="text-[10px] leading-snug text-zinc-550 font-mono mt-1">{hint}</span>}
    </label>
  );
}

// --- Market settings -------------------------------------------------------
function MarketSettingsCard() {
  const { notify } = useToast();
  const [settings, setSettings] = useState<MarketSettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<MarketSettings | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMarketSettings()
      .then((s) => {
        if (!cancelled) {
          setSettings(s);
          setSavedSettings(s);
        }
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = (p: Partial<MarketSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...p } : prev));

  const dirty =
    settings !== null &&
    savedSettings !== null &&
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateMarketSettings(settings);
      setSavedSettings(settings);
      notify({ tone: "success", title: "Market settings saved" });
    } catch (err) {
      notify({
        tone: "danger",
        title: "Couldn't save settings",
        message: errorMessage(err, "Please try again."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border border-zinc-805 bg-zinc-955/20 hover:border-pink-500/10 p-5 transition-all duration-300 shadow-md">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent" />
      <div className="mb-5 flex items-center gap-2">
        <GearSix size={16} className="text-pink-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-405">Market Configuration</h2>
      </div>

      {!loaded ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      ) : unavailable || !settings ? (
        <p className="py-4 text-sm text-zinc-500 font-mono">
          Market settings are unavailable right now.
        </p>
      ) : (
        <div className="space-y-5">
          <button
            type="button"
            role="switch"
            aria-checked={settings.isMaintenanceMode}
            aria-label="Maintenance mode"
            onClick={() => patch({ isMaintenanceMode: !settings.isMaintenanceMode })}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-left transition-colors hover:border-zinc-700 cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Power
                size={18}
                weight="bold"
                className={settings.isMaintenanceMode ? "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" : "text-zinc-500"}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">Maintenance mode</span>
            </span>
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${
                settings.isMaintenanceMode ? "bg-amber-500" : "bg-zinc-800"
              }`}
            >
              <motion.span
                layout
                transition={spring}
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-zinc-100 ${
                  settings.isMaintenanceMode ? "right-0.5" : "left-0.5"
                }`}
              />
            </span>
          </button>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <DecimalField
              label="pp multiplier"
              value={settings.ppMultiplier}
              onChange={(n) => patch({ ppMultiplier: n })}
              min={0.0001}
              step={0.0001}
            />
            <DecimalField
              label="Trade multiplier"
              value={settings.tradeMultiplier}
              onChange={(n) => patch({ tradeMultiplier: n })}
              min={0.0001}
              step={0.0001}
            />
            <DecimalField
              label="Decay multiplier"
              value={settings.decayMultiplier}
              onChange={(n) => patch({ decayMultiplier: n })}
              min={0.0001}
              step={0.0001}
            />
            <DecimalField
              label="Trade fee multiplier"
              value={settings.tradeFeeMultiplier}
              onChange={(n) => patch({ tradeFeeMultiplier: n })}
              min={0}
              max={10}
              step={0.05}
              hint="1 = baseline, 0 = no fee. Max 10×."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {dirty && !saving && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono" aria-live="polite">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                Unsaved changes
              </span>
            )}
            <button
              onClick={save}
              disabled={saving || !dirty}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                dirty 
                  ? "bg-pink-500 text-white hover:bg-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]" 
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-transparent"
              }`}
            >
              <FloppyDisk size={14} weight="bold" />
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// --- Tracked players -------------------------------------------------------
const TRACKED_PAGE_SIZE = 25;

function TrackedPlayersCard() {
  const { notify } = useToast();
  const [players, setPlayers] = useState<TrackedPlayer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [osuUserId, setOsuUserId] = useState("");
  const [tier, setTier] = useState<TrackingTier>("Tier1");
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const cancelRemoveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirmRemoveId) cancelRemoveRef.current?.focus();
  }, [confirmRemoveId]);

  const totalPages = Math.max(1, Math.ceil(totalCount / TRACKED_PAGE_SIZE));

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  const load = useCallback(async () => {
    try {
      const result = await getTrackedPlayers({
        page,
        pageSize: TRACKED_PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setPlayers(result.items);
      setTotalCount(result.totalCount ?? result.items.length);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    } finally {
      setLoaded(true);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const onAdd = async () => {
    const id = Number(osuUserId);
    if (!osuUserId || !Number.isFinite(id) || id <= 0) {
      notify({ tone: "danger", title: "Enter a valid osu! user ID" });
      return;
    }
    setAdding(true);
    try {
      const created = await addTrackedPlayer({ osuUserId: id, tier });
      setOsuUserId("");
      notify({ tone: "success", title: `Tracking ${created.username || id}` });
      setSearch("");
      if (page === 1 && debouncedSearch === "") {
        load();
      } else {
        setPage(1);
      }
    } catch (err) {
      notify({
        tone: "danger",
        title: "Couldn't add player",
        message: errorMessage(err, "Please try again."),
      });
    } finally {
      setAdding(false);
    }
  };

  const onToggleActive = async (p: TrackedPlayer) => {
    const next = !p.isActive;
    setPlayers((prev) =>
      prev.map((x) => (x.trackedPlayerId === p.trackedPlayerId ? { ...x, isActive: next } : x)),
    );
    try {
      await updateTrackedPlayer(p.trackedPlayerId, { isActive: next });
    } catch (err) {
      setPlayers((prev) =>
        prev.map((x) =>
          x.trackedPlayerId === p.trackedPlayerId ? { ...x, isActive: p.isActive } : x,
        ),
      );
      notify({
        tone: "danger",
        title: "Couldn't update player status",
        message: errorMessage(err, "Please try again."),
      });
    }
  };

  const onRemove = async (p: TrackedPlayer) => {
    setConfirmRemoveId(null);
    const snapshot = players;
    setPlayers((prev) => prev.filter((x) => x.trackedPlayerId !== p.trackedPlayerId));
    setTotalCount((c) => Math.max(0, c - 1));
    try {
      await removeTrackedPlayer(p.trackedPlayerId);
      notify({ tone: "success", title: `Removed ${p.username || p.osuUserId}` });
    } catch (err) {
      setPlayers(snapshot);
      setTotalCount((c) => c + 1);
      notify({
        tone: "danger",
        title: "Couldn't remove player",
        message: errorMessage(err, "Please try again."),
      });
    }
  };

  return (
    <Card className="relative overflow-hidden border border-zinc-805 bg-zinc-955/20 hover:border-pink-500/10 p-5 transition-all duration-300 shadow-md">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent" />
      <div className="mb-5 flex items-center gap-2">
        <UsersThree size={16} className="text-pink-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-405">Tracked Players</h2>
      </div>

      {/* Add form */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
            osu! user ID
          </span>
          <input
            type="number"
            min={1}
            value={osuUserId}
            placeholder="e.g. 124493"
            onChange={(e) => setOsuUserId(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:w-36">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
            Tracking Tier
          </span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as TrackingTier)}
            className={inputClass}
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={onAdd}
          disabled={adding}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-40 shadow-sm"
        >
          <Plus size={14} weight="bold" />
          {adding ? "Adding…" : "Add"}
        </button>
      </div>

      {/* Search + count */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={search}
            placeholder="Search by name or osu! user ID…"
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
        {loaded && !unavailable && (
          <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-zinc-500">
            {formatNumber(totalCount)} tracked
          </span>
        )}
      </div>

      {!loaded ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : unavailable ? (
        <p className="py-4 text-sm text-zinc-500 font-mono">
          The tracked-players service is unavailable right now.
        </p>
      ) : players.length === 0 ? (
        <EmptyState
          icon={<UsersThree size={20} weight="bold" className="text-zinc-650" />}
          title={debouncedSearch ? "No matches" : "No tracked players"}
          message={
            debouncedSearch
              ? `No tracked players match "${debouncedSearch}".`
              : "Add an osu! user ID above to start tracking a player."
          }
        />
      ) : (
        <motion.ul
          className="divide-y divide-zinc-850/60 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/20 shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {players.map((p) => (
            <motion.li
              key={p.trackedPlayerId}
              variants={fadeUp}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900/20 transition-colors"
            >
              <Avatar src={p.avatarUrl} name={p.username || String(p.osuUserId)} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {p.stockId ? (
                    <Link
                      href={`/stocks/${p.stockId}`}
                      className="truncate text-xs font-bold text-zinc-200 hover:text-pink-400 transition-colors"
                    >
                      {p.username || `osu! #${p.osuUserId}`}
                    </Link>
                  ) : (
                    <span className="truncate text-xs font-bold text-zinc-200">
                      {p.username || `osu! #${p.osuUserId}`}
                    </span>
                  )}
                  <Badge tone="neutral" className="text-[8px] font-bold uppercase tracking-wider py-0.5 px-1.5">{p.tier}</Badge>
                </div>
                <span className="font-mono text-[10px] font-semibold tracking-wide text-zinc-500">
                  #{p.osuUserId}
                </span>
              </div>
              {confirmRemoveId === p.trackedPlayerId ? (
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mr-1">Remove?</span>
                  <button
                    type="button"
                    onClick={() => onRemove(p)}
                    className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    ref={cancelRemoveRef}
                    type="button"
                    onClick={() => setConfirmRemoveId(null)}
                    className="rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 border border-zinc-800 hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleActive(p)}
                    aria-pressed={p.isActive}
                    className={`rounded-lg px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                      p.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {p.isActive ? "Active" : "Paused"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveId(p.trackedPlayerId)}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer transition-all"
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                </div>
              )}
            </motion.li>
          ))}
        </motion.ul>
      )}

      {loaded && !unavailable && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-350 transition-colors hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <CaretLeft size={12} weight="bold" />
            Prev
          </button>
          <span className="font-mono text-xs font-semibold tabular-nums text-zinc-500">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-350 transition-colors hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            Next
            <CaretRight size={12} weight="bold" />
          </button>
        </div>
      )}
    </Card>
  );
}

// --- Transaction monitor ---------------------------------------------------
type MonitorTab = "trades" | "wallet";

function FilterChip({ label, value, onClear }: { label: string; value: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 py-1 pl-2.5 pr-1 text-[9px] font-bold uppercase tracking-wider text-pink-300">
      <span className="text-pink-400/80 font-mono">{label}:</span>
      <span className="max-w-[10rem] truncate">{value}</span>
      <button
        type="button"
        onClick={onClear}
        className="rounded-md p-0.5 text-pink-300/70 hover:bg-pink-500/20 hover:text-pink-200 transition-colors cursor-pointer"
      >
        <X size={11} weight="bold" />
      </button>
    </span>
  );
}

function TransactionMonitorCard() {
  const [tab, setTab] = useState<MonitorTab>("trades");
  const [tradeType, setTradeType] = useState<"" | TradeType>("");
  const [walletType, setWalletType] = useState<"" | WalletTransactionType>("");
  const [userFilter, setUserFilter] = useState<{ id: string; name: string } | null>(null);
  const [stockFilter, setStockFilter] = useState<{ id: string; name: string } | null>(null);

  const [trades, setTrades] = useState<AdminTrade[]>([]);
  const [walletTx, setWalletTx] = useState<AdminWalletTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / TRACKED_PAGE_SIZE));

  const switchTab = (t: MonitorTab) => {
    if (t === tab) return;
    setTab(t);
    setPage(1);
    if (t === "wallet") setStockFilter(null);
  };

  const filterByUser = (id: string, name: string) => {
    setUserFilter({ id, name });
    setPage(1);
  };
  const filterByStock = (id: string, name: string) => {
    setStockFilter({ id, name });
    setPage(1);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "trades") {
        const res = await getAdminTrades({
          page,
          pageSize: TRACKED_PAGE_SIZE,
          tradeType: tradeType || undefined,
          userId: userFilter?.id,
          stockId: stockFilter?.id,
        });
        setTrades(res.items);
        setTotalCount(res.totalCount ?? res.items.length);
      } else {
        const res = await getAdminWalletTransactions({
          page,
          pageSize: TRACKED_PAGE_SIZE,
          type: walletType || undefined,
          userId: userFilter?.id,
        });
        setWalletTx(res.items);
        setTotalCount(res.totalCount ?? res.items.length);
      }
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [tab, page, tradeType, walletType, userFilter, stockFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const hasFilters = Boolean(userFilter || stockFilter || tradeType || walletType);
  const clearAll = () => {
    setUserFilter(null);
    setStockFilter(null);
    setTradeType("");
    setWalletType("");
    setPage(1);
  };

  const tabBtn = (t: MonitorTab, label: string) =>
    `rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
      tab === t
        ? "bg-pink-500/10 text-pink-400 border-pink-500/35 shadow-[0_0_12px_rgba(236,72,153,0.1)]"
        : "bg-zinc-950/20 text-zinc-500 border-zinc-800/80 hover:text-zinc-350 hover:border-zinc-700"
    }`;

  return (
    <Card className="relative overflow-hidden border border-zinc-805 bg-zinc-955/20 hover:border-pink-500/10 p-5 transition-all duration-300 shadow-md">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent" />
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Receipt size={16} className="text-pink-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-405">Transaction Monitor</h2>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/30 p-1 self-start">
          <button type="button" onClick={() => switchTab("trades")} className={tabBtn("trades", "Trades")}>
            Trades
          </button>
          <button type="button" onClick={() => switchTab("wallet")} className={tabBtn("wallet", "Wallet")}>
            Wallet ledger
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {tab === "trades" ? (
          <select
            value={tradeType}
            onChange={(e) => {
              setTradeType(e.target.value as "" | TradeType);
              setPage(1);
            }}
            aria-label="Filter by trade side"
            className={filterSelectClass}
          >
            <option value="">All sides</option>
            <option value="Buy">Buy</option>
            <option value="Sell">Sell</option>
          </select>
        ) : (
          <select
            value={walletType}
            onChange={(e) => {
              setWalletType(e.target.value as "" | WalletTransactionType);
              setPage(1);
            }}
            aria-label="Filter by transaction type"
            className={filterSelectClass}
          >
            <option value="">All types</option>
            {WALLET_TYPES.map((t) => (
              <option key={t} value={t}>
                {WALLET_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        )}

        {userFilter && (
          <FilterChip label="User" value={userFilter.name} onClear={() => { setUserFilter(null); setPage(1); }} />
        )}
        {tab === "trades" && stockFilter && (
          <FilterChip label="Stock" value={stockFilter.name} onClear={() => { setStockFilter(null); setPage(1); }} />
        )}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 hover:text-zinc-350 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
        <span className="ml-auto shrink-0 font-mono text-xs font-semibold tabular-nums text-zinc-500">
          {formatNumber(totalCount)} {tab === "trades" ? "trades" : "entries"}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : unavailable ? (
        <p className="py-4 text-sm text-zinc-500 font-mono">The transaction feed is unavailable right now.</p>
      ) : (tab === "trades" ? trades.length === 0 : walletTx.length === 0) ? (
        <EmptyState
          icon={<Receipt size={20} weight="bold" className="text-zinc-650" />}
          title="No transactions"
          message={hasFilters ? "No transactions match the current filters." : "No activity recorded yet."}
        />
      ) : tab === "trades" ? (
        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/20 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          {/* Mobile Swipe Cue */}
          <div className="block sm:hidden text-center py-2 bg-pink-500/5 border-b border-zinc-850/50 text-[10px] font-black uppercase tracking-widest text-pink-400/80 animate-pulse">
            ← Swipe sideways to view all trade records →
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[44rem] text-sm">
              <caption className="sr-only">Trades: trader, player, side, quantity, price, total, time.</caption>
              <thead>
                <tr className="border-b border-zinc-800 text-left text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900/40">
                  <th className="px-4 py-3 font-semibold">Trader</th>
                  <th className="px-4 py-3 font-semibold">Player</th>
                  <th className="px-4 py-3 font-semibold">Side</th>
                  <th className="px-4 py-3 text-right font-semibold">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60 font-mono text-xs">
                {trades.map((t) => (
                  <tr key={t.tradeId} className="transition-colors hover:bg-zinc-900/30 border-l border-l-transparent hover:border-l-pink-500">
                    <td className="px-4 py-3 font-sans">
                      <button
                        type="button"
                        onClick={() => filterByUser(t.userId, t.username)}
                        className="flex items-center gap-2.5 text-left hover:text-pink-400 cursor-pointer"
                        title="Filter by this user"
                      >
                        <Avatar src={t.avatarUrl} name={t.username} size="xs" />
                        <span className="max-w-[8rem] truncate font-bold text-zinc-200">{t.username}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <button
                        type="button"
                        onClick={() => filterByStock(t.stockId, t.playerName ?? "stock")}
                        className="max-w-[9rem] truncate text-left font-bold text-zinc-350 hover:text-pink-400 cursor-pointer"
                        title="Filter by this stock"
                      >
                        {t.playerName ?? "—"}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <Badge tone={t.tradeType === "Buy" ? "success" : "danger"} className="font-bold text-[9px] uppercase tracking-wider py-0.5 px-2">{t.tradeType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-zinc-300">
                      {formatShares(t.quantity)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-300">
                      <Money value={t.unitPrice} />
                    </td>
                    <td className="px-4 py-3 text-right font-black text-zinc-150">
                      <Money value={t.totalAmount} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-500">
                      {formatDateTime(t.executedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/20 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          {/* Mobile Swipe Cue */}
          <div className="block sm:hidden text-center py-2 bg-pink-500/5 border-b border-zinc-850/50 text-[10px] font-black uppercase tracking-widest text-pink-400/80 animate-pulse">
            ← Swipe sideways to view ledger details →
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[32rem] text-sm">
              <caption className="sr-only">Wallet ledger: owner, type, amount, time.</caption>
              <thead>
                <tr className="border-b border-zinc-800 text-left text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900/40">
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60 font-mono text-xs">
                {walletTx.map((tx) => {
                  const isCredit = WALLET_CREDIT_TYPES.has(tx.transactionType);
                  const TypeIcon = isCredit ? ArrowDownLeft : ArrowUpRight;
                  const signedAmount = (isCredit ? 1 : -1) * Math.abs(tx.amount);
                  return (
                    <tr key={tx.id} className="transition-colors hover:bg-zinc-900/30 border-l border-l-transparent hover:border-l-pink-500">
                      <td className="px-4 py-3 font-sans">
                        <button
                          type="button"
                          onClick={() => filterByUser(tx.userId, tx.username)}
                          className="max-w-[10rem] truncate text-left font-bold text-zinc-200 hover:text-pink-400 cursor-pointer"
                          title="Filter by this user"
                        >
                          {tx.username}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <Badge tone={isCredit ? "success" : "danger"} className="font-bold text-[9px] uppercase tracking-wider py-0.5 px-2">
                          <TypeIcon size={12} weight="bold" className="mr-1" />
                          {WALLET_TYPE_LABELS[tx.transactionType] ?? tx.transactionType}
                        </Badge>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-black tabular-nums ${
                          isCredit ? "text-emerald-400" : "text-rose-455"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Coin size="h-3 w-3" className={isCredit ? "text-emerald-400" : "text-rose-455"} />
                          {formatChange(signedAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-500">
                        {formatDateTime(tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !unavailable && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-350 transition-colors hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <CaretLeft size={12} weight="bold" />
            Prev
          </button>
          <span className="font-mono text-xs font-semibold tabular-nums text-zinc-500">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-350 transition-colors hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            Next
            <CaretRight size={12} weight="bold" />
          </button>
        </div>
      )}
    </Card>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <PageShell>
        <Skeleton className="h-9 w-40" />
        <div className="mt-8 space-y-6">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <Reveal>
          <Card className="border border-zinc-805 bg-zinc-955/20 p-6">
            <EmptyState
              icon={<Lock size={20} weight="bold" className="text-pink-400" />}
              title="Access Restricted"
              message="You need to be signed in as an administrator to view the control panel."
              action={
                <Link href="/login" className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-sm">
                  Go to login
                </Link>
              }
            />
          </Card>
        </Reveal>
      </PageShell>
    );
  }

  if (user.role !== "Admin") {
    return (
      <PageShell>
        <Reveal>
          <Card className="border border-zinc-805 bg-zinc-955/20 p-6">
            <EmptyState
              icon={<ShieldWarning size={20} weight="bold" className="text-rose-400" />}
              title="Access Denied"
              message="This administrative sector is restricted to platform operators."
              action={
                <Link href="/" className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer">
                  Back to market
                </Link>
              }
            />
          </Card>
        </Reveal>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Reveal>
        <header className="mb-8 flex items-center gap-3 border-b border-zinc-800/80 pb-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/15 text-pink-400 ring-1 ring-inset ring-pink-500/25 shadow-[0_0_12px_rgba(236,72,153,0.15)]">
            <GearSix size={20} weight="bold" className="animate-[spin_20s_linear_infinite]" />
          </span>
          <div>
            <h1 className="pb-2 text-3xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-violet-600 via-violet-200 to-fuchsia-700 dark:from-violet-500 dark:via-zinc-100 dark:to-fuchsia-500 bg-clip-text text-transparent animate-gradient-text">
              Admin Panel
            </h1>
            <p className="mt-1.5 text-xs text-zinc-405 font-mono">
              Central node configuration and player tracking indexes.
            </p>
          </div>
        </header>
      </Reveal>

      <div className="space-y-6">
        <Reveal delay={0.05}>
          <MarketSettingsCard />
        </Reveal>
        <Reveal delay={0.1}>
          <TrackedPlayersCard />
        </Reveal>
        <Reveal delay={0.15}>
          <TransactionMonitorCard />
        </Reveal>
      </div>
    </PageShell>
  );
}
