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
    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginTop: 28, marginBottom: 12 }}>
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
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>
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
              <th key={i} style={{ textAlign: 'left', fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-secondary)', padding: '8px 14px', borderBottom: '1px solid var(--bg-tertiary)', whiteSpace: 'nowrap' as const }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
              {row.map((cell, ci) => (
                <td key={ci} className="font-serif" style={{ fontSize: 14, color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)', padding: '9px 14px', borderBottom: '1px solid var(--bg-tertiary)', lineHeight: 1.5, fontWeight: ci === 0 ? 500 : 400 }}>
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
        <div key={i} className="rounded-xl" style={{ display: 'flex', gap: 14, padding: '14px 16px', marginBottom: 8, background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderLeft: `3px solid ${item.color || 'var(--accent-primary)'}` }}>
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: item.color || 'var(--accent-primary)', whiteSpace: 'nowrap' as const }}>
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

function SectionCard({ section, forceOpen }: { section: MethodologySection; forceOpen: boolean }) {
  const [open, setOpen] = useState(forceOpen);
  useEffect(() => { if (forceOpen) setOpen(true); }, [forceOpen]);

  // Extract preview pills from the first list block (shown when collapsed)
  const previewItems = section.blocks.find(b => b.type === 'list')?.items?.slice(0, 5) ?? [];

  return (
    <div
      id={section.id}
      style={{
        background: `${section.accent}1C`,
        border: `1px solid ${section.accent}45`,
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'box-shadow 200ms ease',
        boxShadow: open ? `0 6px 24px ${section.accent}1A` : '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '14px 18px', display: 'block', width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${section.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" style={{ color: section.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d={section.icon} />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 2 }}>
              {section.title}
            </h2>
            <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
              {section.subtitle}
            </p>
          </div>
          <svg width="14" height="14" style={{ color: 'var(--text-tertiary)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Preview pills — visible when collapsed */}
        {!open && previewItems.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, paddingLeft: 52 }}>
            {previewItems.map(item => (
              <span
                key={item.label}
                style={{
                  padding: '3px 10px', borderRadius: 20,
                  border: `1px solid ${item.color || section.accent}40`,
                  color: item.color || section.accent,
                  fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  whiteSpace: 'nowrap' as const,
                  background: `${item.color || section.accent}0A`,
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}
      </button>

      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${section.accent}30`, background: 'var(--bg-primary)' }}>
          <div style={{ paddingTop: 16 }}>
            {section.blocks.map((block, i) => renderBlock(block, i))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ToC — styled like the Luminary orbit sidebar ─────────────────────

function ToC({ sections, activeId, onNavigate }: { sections: MethodologySection[]; activeId: string; onNavigate: (id: string) => void }) {

  return (
    <nav style={{ position: 'sticky', top: 80 }}>
      {/* Label */}
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Contents
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            className="w-full text-left flex items-center gap-2.5 transition-all"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', color: activeId === s.id ? s.accent : 'var(--text-tertiary)' }}
            onMouseEnter={e => { if (activeId !== s.id) e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { if (activeId !== s.id) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <div style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, backgroundColor: activeId === s.id ? s.accent : 'transparent', border: activeId === s.id ? 'none' : '1px solid var(--bg-tertiary)', transition: 'all 200ms ease' }} />
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: activeId === s.id ? 600 : 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
              {s.title}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom quote — mirrors orbit sidebar */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px dashed var(--bg-tertiary)' }}>
        <p className="font-serif italic" style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6, opacity: 0.7 }}>
          &ldquo;Every formula is a window into the invisible.&rdquo;
        </p>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginTop: 6, opacity: 0.6 }}>
          Intelligence · Transparency
        </p>
      </div>
    </nav>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MethodologyPage() {
  const router = useRouter();
  const { data, isLoading } = useGetMethodologyQuery();
  const [activeId, setActiveId] = useState('');
  const [expandedId, setExpandedId] = useState('');
  const mainRef = useRef<HTMLDivElement>(null);

  const navigate = (id: string) => {
    setActiveId(id);
    setExpandedId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!data) return;
    const observer = new IntersectionObserver(
      entries => { const visible = entries.filter(e => e.isIntersecting); if (visible.length) setActiveId(visible[0].target.id); },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    data.sections.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [data]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Soft background blobs */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-15%', width: 700, height: 700, borderRadius: '50%', background: 'var(--accent-secondary)', opacity: 0.07, filter: 'blur(110px)' }} />
        <div style={{ position: 'absolute', top: '-6%', right: '-16%', width: 800, height: 800, borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.06, filter: 'blur(130px)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── Top bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)', borderBottom: '1px solid var(--bg-tertiary)', padding: '14px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div style={{ width: 1, height: 16, background: 'var(--bg-tertiary)' }} />
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Lumis · The Alchemy
          </span>
        </div>
        {data && (
          <div className="flex items-center gap-3">
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>v{data.version}</span>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
              Updated {new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* ── Page content wrapper ── */}
      <div style={{ padding: '0 64px' }}>

      {/* ── Hero ── */}
      <div style={{ padding: '16px 0 20px' }}>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500, color: 'var(--accent-ai)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Intelligence · Transparency
        </p>
        <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 10 }}>
          How Lumis works
        </h1>
        <p className="font-serif" style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Every formula, framework, and derivation used to build your relationship intelligence — fully documented, openly explained.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {data?.sections.map(s => (
            <button
              key={s.id}
              onClick={() => navigate(s.id)}
              style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${s.accent}40`, background: `${s.accent}12`, color: s.accent, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: '32px 0 80px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl" style={{ background: 'var(--bg-secondary)', marginBottom: 16, height: 100 }} />
          ))}
        </div>
      )}

      {/* ── Body ── */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40, alignItems: 'start', padding: '16px 0 48px' }}>
          <ToC sections={data.sections} activeId={activeId} onNavigate={navigate} />
          <div ref={mainRef}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.sections.map((section, i) => (
                <SectionCard key={section.id} section={section} forceOpen={expandedId === section.id || i === 0} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-3" style={{ paddingTop: 40 }}>
              <div style={{ height: 1, flex: 1, background: 'var(--bg-tertiary)' }} />
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Lumis · The Alchemy v{data.version} · Built with transparency
              </p>
              <div style={{ height: 1, flex: 1, background: 'var(--bg-tertiary)' }} />
            </div>
          </div>
        </div>
      )}

      </div>{/* /page content wrapper */}
      </div>{/* /position:relative zIndex:1 */}
    </div>
  );
}
