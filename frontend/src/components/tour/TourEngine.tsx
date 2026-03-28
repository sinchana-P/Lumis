'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTour } from '@/contexts/TourContext';
import { useGetMembersQuery } from '@/store/api/membersApi';
import { TOUR_STEPS, TOTAL_STEPS } from './tourSteps';
import { TourSpotlight } from './TourSpotlight';
import { TourModal } from './TourModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SYSTEM_NODE_NAMES = ['mia', 'luma', 'lumia', 'system node'];

function isSystemNodeName(name: string) {
  const n = name?.toLowerCase?.()?.trim?.() ?? '';
  return SYSTEM_NODE_NAMES.some(s => n.includes(s));
}

function resolvePagePath(page: string, systemNodeId: string | null): string {
  if (!systemNodeId) return page;
  return page.replace(':systemNode', systemNodeId);
}

// ─── TourEngine ───────────────────────────────────────────────────────────────

export function TourEngine() {
  const { active, stepIndex, systemNodeId, next, prev, end, setSystemNodeId } = useTour();
  const router = useRouter();
  const pathname = usePathname();
  const { data: membersResponse } = useGetMembersQuery(undefined, { skip: !active });

  // Track last step we acted on to avoid double-firing
  const lastActedStep = useRef(-1);
  // Track if we're waiting for system node before proceeding
  const [waitingForNode, setWaitingForNode] = useState(false);

  // ── Resolve system node from API ──────────────────────────────────────────
  useEffect(() => {
    if (!active || systemNodeId) return;
    const members: any[] = membersResponse?.data ?? [];
    const found =
      members.find((m) => m.isSystemNode === true) ??
      members.find((m) => m.relationType === 'system') ??
      members.find((m) => isSystemNodeName(m.fullName));
    if (found) {
      setSystemNodeId(found.id);
      setWaitingForNode(false);
    }
  }, [active, membersResponse, systemNodeId, setSystemNodeId]);

  // ── Resolve system node from DOM (orbit page nodes) ───────────────────────
  useEffect(() => {
    if (!active || systemNodeId) return;
    if (!pathname || !pathname.startsWith('/orbit') || pathname.includes('/orbit/')) return;

    let attempts = 0;
    const scan = () => {
      // Look for member nodes rendered in the orbit canvas
      const nodes = document.querySelectorAll('[data-member-id]');
      for (const node of nodes) {
        const name = node.getAttribute('data-member-name') ?? '';
        const id = node.getAttribute('data-member-id');
        if (id && isSystemNodeName(name)) {
          setSystemNodeId(id);
          setWaitingForNode(false);
          return;
        }
      }
      // Also look in list view rows
      const rows = document.querySelectorAll('[data-member-id]');
      for (const row of rows) {
        const id = row.getAttribute('data-member-id');
        if (id) {
          // If only one member exists, assume it's the system node
          if (nodes.length === 1) {
            setSystemNodeId(id);
            setWaitingForNode(false);
            return;
          }
        }
      }
      if (++attempts < 20) setTimeout(scan, 300);
    };
    const t = setTimeout(scan, 500);
    return () => clearTimeout(t);
  }, [active, systemNodeId, pathname, setSystemNodeId]);

  // ── When waiting & system node just resolved, navigate ───────────────────
  useEffect(() => {
    if (!waitingForNode || !systemNodeId || !active) return;
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;
    const resolved = resolvePagePath(step.page, systemNodeId);
    setWaitingForNode(false);
    router.push(resolved);
    if (step.clickTab) {
      setTimeout(() => {
        const el = document.querySelector(`[data-tour="${step.clickTab}"]`) as HTMLElement | null;
        el?.click();
      }, 900);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingForNode, systemNodeId]);

  // ── Navigate + click tab when step changes ────────────────────────────────
  useEffect(() => {
    if (!active) return;
    if (lastActedStep.current === stepIndex) return;
    lastActedStep.current = stepIndex;

    const rawStep = TOUR_STEPS[stepIndex];
    if (!rawStep) return;

    const needsSystemNode = rawStep.page.includes(':systemNode');

    // If this step needs system node and we don't have it yet — go to orbit to find it
    if (needsSystemNode && !systemNodeId) {
      setWaitingForNode(true);
      if (pathname !== '/orbit') router.push('/orbit');
      return;
    }

    const targetPage = resolvePagePath(rawStep.page, systemNodeId);
    const needsNav = targetPage !== pathname;

    const clickTab = () => {
      if (!rawStep.clickTab) return;
      const tryClick = (attempts = 0) => {
        const el = document.querySelector(`[data-tour="${rawStep.clickTab}"]`) as HTMLElement | null;
        if (el) {
          el.click();
        } else if (attempts < 10) {
          setTimeout(() => tryClick(attempts + 1), 200);
        }
      };
      tryClick();
    };

    if (needsNav) {
      router.push(targetPage);
      setTimeout(clickTab, 900);
    } else {
      setTimeout(clickTab, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, active]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!active) return null;

  const rawStep = TOUR_STEPS[stepIndex];
  if (!rawStep) return null;

  if (waitingForNode) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--bg-tertiary)' }}>
          <p className="font-rounded text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
            Opening system node…
          </p>
        </div>
      </div>
    );
  }

  const resolvedStep = {
    ...rawStep,
    page: resolvePagePath(rawStep.page, systemNodeId),
  };

  return (
    <>
      {/* key=pathname forces spotlight to remount & re-poll on every page change */}
      <TourSpotlight
        key={`${pathname}-${resolvedStep.id}`}
        target={resolvedStep.target}
        padding={resolvedStep.spotlightPadding ?? 8}
      />
      <TourModal
        step={resolvedStep}
        stepIndex={stepIndex}
        totalSteps={TOTAL_STEPS}
        onNext={next}
        onPrev={prev}
        onEnd={end}
      />
    </>
  );
}
