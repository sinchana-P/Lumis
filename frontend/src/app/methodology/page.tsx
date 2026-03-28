'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMethodologyQuery, type ContentBlock, type MethodologySection } from '@/store/api/methodologyApi';

// ─── Block renderers ──────────────────────────────────────────────────────────

function ParagraphBlock({ text }: { text: string }) {
  return (
    <p className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.85, marginBottom: 18 }}>
      {text}
    </p>
  );
}

function HeadingBlock({ text }: { text: string }) {
  return (
    <p className="font-rounded uppercase" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.14em', marginTop: 28, marginBottom: 12 }}>
      {text}
    </p>
  );
}

function NoteBlock({ text }: { text: string }) {
  return (
    <div style={{ borderLeft: '2px solid #C4A87A', paddingLeft: 16, marginBottom: 18, marginTop: 4 }}>
      <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {text}
      </p>
    </div>
  );
}

function FormulaBlock({ label, expression, note }: { label: string; expression: string; note?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p className="font-rounded" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </p>
      <div
        className="rounded-xl"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid color-mix(in srgb, var(--accent-ai) 20%, transparent)',
          padding: '14px 20px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          color: 'var(--accent-ai)',
          letterSpacing: '0.03em',
          lineHeight: 1.6,
          wordBreak: 'break-all' as const,
        }}
      >
        {expression}
      </div>
      {note && (
        <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 6, lineHeight: 1.6 }}>
          {note}
        </p>
      )}
    </div>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 18 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  padding: '8px 14px',
                  borderBottom: '1px solid var(--bg-tertiary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{ background: ri % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="font-serif"
                  style={{
                    fontSize: 14,
                    color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '9px 14px',
                    borderBottom: '1px solid var(--bg-tertiary)',
                    lineHeight: 1.5,
                    fontWeight: ci === 0 ? 500 : 400,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListBlockComponent({ items }: { items: { label: string; text: string; color?: string }[] }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl"
          style={{
            display: 'flex',
            gap: 14,
            padding: '14px 16px',
            marginBottom: 8,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-tertiary)',
            borderLeft: `3px solid ${item.color || 'var(--accent-primary)'}`,
          }}
        >
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: item.color || 'var(--accent-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </span>
          </div>
          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: ContentBlock, i: number) {
  switch (block.type) {
    case 'paragraph': return <ParagraphBlock key={i} text={block.text!} />;
    case 'heading':   return <HeadingBlock   key={i} text={block.text!} />;
    case 'note':      return <NoteBlock      key={i} text={block.text!} />;
    case 'formula':   return <FormulaBlock   key={i} label={block.label!} expression={block.expression!} note={block.note} />;
    case 'table':     return <TableBlock     key={i} headers={block.headers!} rows={block.rows!} />;
    case 'list':      return <ListBlockComponent key={i} items={block.items!} />;
    default:          return null;
  }
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ section, isActive }: { section: MethodologySection; isActive: boolean }) {
  const [open, setOpen] = useState(isActive);

  useEffect(() => { if (isActive) setOpen(true); }, [isActive]);

  return (
    <div
      id={section.id}
      className="rounded-2xl"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-tertiary)',
        borderLeft: `3px solid ${section.accent}`,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      {/* Section header — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-4 text-left"
        style={{ padding: '22px 28px', background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        {/* Icon */}
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{ width: 36, height: 36, background: `${section.accent}1A`, marginTop: 2 }}
        >
          <svg className="w-4 h-4" style={{ color: section.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d={section.icon} />
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>
            {section.title}
          </h2>
          <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            {section.subtitle}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className="w-4 h-4 flex-shrink-0"
          style={{ color: 'var(--text-tertiary)', marginTop: 8, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable body */}
      {open && (
        <div style={{ padding: '0 28px 28px', borderTop: '1px solid var(--bg-tertiary)' }}>
          <div style={{ paddingTop: 24 }}>
            {section.blocks.map((block, i) => renderBlock(block, i))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Table of contents ────────────────────────────────────────────────────────

function ToC({ sections, activeId }: { sections: MethodologySection[]; activeId: string }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav style={{ position: 'sticky', top: 80 }}>
      <p className="font-rounded uppercase" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-tertiary)', marginBottom: 16 }}>
        Contents
      </p>
      {sections.map(s => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          className="w-full text-left flex items-center gap-2 transition-all"
          style={{
            padding: '7px 10px',
            borderRadius: 8,
            border: 'none',
            background: activeId === s.id ? `${s.accent}15` : 'transparent',
            cursor: 'pointer',
            marginBottom: 2,
          }}
        >
          <div
            style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: activeId === s.id ? s.accent : 'var(--bg-tertiary)',
              transition: 'background 200ms ease',
            }}
          />
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              color: activeId === s.id ? s.accent : 'var(--text-tertiary)',
              transition: 'color 200ms ease',
            }}
          >
            {s.title}
          </span>
        </button>
      ))}
    </nav>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl" style={{ background: 'var(--bg-secondary)', marginBottom: 16, height: 100 }} />
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MethodologyPage() {
  const router = useRouter();
  const { data, isLoading } = useGetMethodologyQuery();
  const [activeId, setActiveId] = useState('');
  const mainRef = useRef<HTMLDivElement>(null);

  // Scroll spy
  useEffect(() => {
    if (!data) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    data.sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [data]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--bg-tertiary)',
          padding: '14px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div style={{ width: 1, height: 16, background: 'var(--bg-tertiary)' }} />

          <div>
            <span className="font-rounded" style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Lumis · Methodology
            </span>
          </div>
        </div>

        {data && (
          <div className="flex items-center gap-3">
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
              v{data.version}
            </span>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
              Updated {new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div style={{ padding: '56px 48px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <p className="font-rounded uppercase" style={{ fontSize: 10, color: 'var(--accent-ai)', letterSpacing: '0.16em', marginBottom: 12 }}>
          Intelligence · Transparency
        </p>
        <h1 className="font-serif" style={{ fontSize: 44, fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16, maxWidth: 640 }}>
          How Lumis works
        </h1>
        <p className="font-serif" style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 580 }}>
          Every formula, framework, and derivation used to build your relationship intelligence — fully documented, openly explained.
        </p>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36, marginBottom: 0 }}>
          {data?.sections.map(s => (
            <button
              key={s.id}
              onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1.5 transition-all"
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: `1px solid ${s.accent}40`,
                background: `${s.accent}12`,
                color: s.accent,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Skeleton />}

      {/* ── Body ────────────────────────────────────────────────── */}
      {data && (
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '32px 48px 80px',
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            gap: 48,
            alignItems: 'start',
          }}
        >
          {/* Left — sticky ToC */}
          <ToC sections={data.sections} activeId={activeId} />

          {/* Right — content */}
          <div ref={mainRef}>
            {data.sections.map((section, i) => (
              <SectionCard
                key={section.id}
                section={section}
                isActive={i === 0}
              />
            ))}

            {/* Footer */}
            <div className="flex items-center justify-center gap-3" style={{ paddingTop: 40 }}>
              <div style={{ height: 1, flex: 1, background: 'var(--bg-tertiary)' }} />
              <p className="font-rounded" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Lumis · Methodology v{data.version} · Built with transparency
              </p>
              <div style={{ height: 1, flex: 1, background: 'var(--bg-tertiary)' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
