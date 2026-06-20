"use client";

import { useCallback, useEffect, useState } from "react";
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
  WarningCircle,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import {
  getMarketSettings,
  updateMarketSettings,
  getTrackedPlayers,
  addTrackedPlayer,
  updateTrackedPlayer,
  removeTrackedPlayer,
  ApiError,
} from "@/lib/api/client";
import type { MarketSettings, TrackedPlayer, TrackingTier } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { fadeUp, staggerContainer, spring } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/Toast";

const TIERS: TrackingTier[] = ["Tier1", "Tier2", "Tier3"];

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm font-mono tabular-nums text-zinc-100 transition-colors focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20";

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">{children}</div>;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message || fallback : fallback;
}

function DecimalField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  step: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
        className={inputClass}
      />
    </label>
  );
}

// --- Market settings -------------------------------------------------------
function MarketSettingsCard() {
  const { notify } = useToast();
  const [settings, setSettings] = useState<MarketSettings | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMarketSettings()
      .then((s) => {
        if (!cancelled) setSettings(s);
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

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      // PUT returns 204 — keep the locally-edited values rather than clearing state.
      await updateMarketSettings(settings);
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
    <Card>
      <div className="mb-5 flex items-center gap-2">
        <GearSix size={18} weight="bold" className="text-pink-400" />
        <h2 className="text-sm font-semibold text-zinc-100">Market Settings</h2>
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
        <p className="py-4 text-sm text-zinc-500">
          Market settings are unavailable right now.
        </p>
      ) : (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => patch({ isMaintenanceMode: !settings.isMaintenanceMode })}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left transition-colors hover:border-zinc-700"
          >
            <span className="flex items-center gap-2.5">
              <Power
                size={18}
                weight="bold"
                className={settings.isMaintenanceMode ? "text-amber-400" : "text-zinc-500"}
              />
              <span className="text-sm font-medium text-zinc-100">Maintenance mode</span>
            </span>
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${
                settings.isMaintenanceMode ? "bg-amber-500" : "bg-zinc-700"
              }`}
            >
              <motion.span
                layout
                transition={spring}
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${
                  settings.isMaintenanceMode ? "right-0.5" : "left-0.5"
                }`}
              />
            </span>
          </button>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              step={0.05}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              <FloppyDisk size={16} weight="bold" />
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// --- Tracked players -------------------------------------------------------
const PAGE_SIZE = 25;

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

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Debounce the search box and reset to the first page whenever the term changes.
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
        pageSize: PAGE_SIZE,
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
    // Reload whenever the page or (debounced) search term changes.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    load();
  }, [load]);

  const onAdd = async () => {
    const id = Number(osuUserId);
    if (!Number.isFinite(id) || id <= 0) {
      notify({ tone: "danger", title: "Enter a valid osu! user ID" });
      return;
    }
    setAdding(true);
    try {
      const created = await addTrackedPlayer({ osuUserId: id, tier });
      setOsuUserId("");
      notify({ tone: "success", title: `Tracking ${created.username || id}` });
      // Jump to an unfiltered first page and reload so the new player and counts
      // reflect server-side ordering/pagination.
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
        title: "Couldn't update player",
        message: errorMessage(err, "Please try again."),
      });
    }
  };

  const onRemove = async (p: TrackedPlayer) => {
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
    <Card>
      <div className="mb-5 flex items-center gap-2">
        <UsersThree size={18} weight="bold" className="text-pink-400" />
        <h2 className="text-sm font-semibold text-zinc-100">Tracked Players</h2>
      </div>

      {/* Add form */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
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
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            Tier
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
        <Button onClick={onAdd} disabled={adding}>
          <Plus size={16} weight="bold" />
          {adding ? "Adding…" : "Add"}
        </Button>
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
          <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-500">
            {totalCount.toLocaleString()} tracked
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
        <p className="py-4 text-sm text-zinc-500">
          The tracked-players service is unavailable right now.
        </p>
      ) : players.length === 0 ? (
        <EmptyState
          icon={<UsersThree size={20} weight="bold" />}
          title={debouncedSearch ? "No matches" : "No tracked players"}
          message={
            debouncedSearch
              ? `No tracked players match "${debouncedSearch}".`
              : "Add an osu! user ID above to start tracking a player."
          }
        />
      ) : (
        <motion.ul
          className="divide-y divide-zinc-800/60 overflow-hidden rounded-xl border border-zinc-800/80"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {players.map((p) => (
            <motion.li
              key={p.trackedPlayerId}
              variants={fadeUp}
              className="flex items-center gap-3 px-4 py-3"
            >
              <Avatar src={p.avatarUrl} name={p.username || String(p.osuUserId)} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {p.stockId ? (
                    <Link
                      href={`/stocks/${p.stockId}`}
                      className="truncate font-medium text-zinc-100 hover:text-pink-300"
                    >
                      {p.username || `osu! #${p.osuUserId}`}
                    </Link>
                  ) : (
                    <span className="truncate font-medium text-zinc-100">
                      {p.username || `osu! #${p.osuUserId}`}
                    </span>
                  )}
                  <Badge tone="neutral">{p.tier}</Badge>
                </div>
                <span className="font-mono text-xs tabular-nums text-zinc-500">
                  #{p.osuUserId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onToggleActive(p)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
                  p.isActive
                    ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-zinc-800/70 text-zinc-400 ring-zinc-700/50 hover:bg-zinc-800"
                }`}
              >
                {p.isActive ? "Active" : "Paused"}
              </button>
              <button
                type="button"
                onClick={() => onRemove(p)}
                aria-label={`Remove ${p.username || p.osuUserId}`}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash size={16} weight="bold" />
              </button>
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
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CaretLeft size={14} weight="bold" />
            Prev
          </button>
          <span className="font-mono text-xs tabular-nums text-zinc-500">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <CaretRight size={14} weight="bold" />
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
          <Card>
            <EmptyState
              icon={<Lock size={20} weight="bold" />}
              title="Please log in"
              message="You need to be signed in as an admin to view this page."
              action={
                <Link href="/login" className={buttonClasses({ size: "sm" })}>
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
          <Card>
            <EmptyState
              icon={<ShieldWarning size={20} weight="bold" />}
              title="Not authorized"
              message="This area is restricted to administrators."
              action={
                <Link href="/" className={buttonClasses({ variant: "secondary", size: "sm" })}>
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
        <header className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/15 text-pink-400 ring-1 ring-inset ring-pink-500/25">
            <GearSix size={20} weight="bold" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
              Admin
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Market configuration and tracked-player management.
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
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-zinc-600">
        <WarningCircle size={14} weight="bold" />
        Admin endpoints follow the assumed <code>/admin</code> contract — reconcile
        with the API once finalized.
      </p>
    </PageShell>
  );
}
