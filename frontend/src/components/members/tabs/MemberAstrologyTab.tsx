'use client';

import { getEmotionalAstrologyDataForMember, type TipIcon } from '@/data/mockAstrologyData';
import { DottedDivider } from '@/components/ui/DottedDivider';

interface Member {
  id: string;
  fullName: string;
  nickname?: string;
  relationType: string;
  relationTypeCustom?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

interface MemberAstrologyTabProps {
  member: Member;
}

// ─── Icon box ─────────────────────────────────────────────────────────────────

function TipIconBox({ icon }: { icon: TipIcon }) {
  const base = `flex items-center justify-center rounded-lg bg-surface border border-primary/20 flex-shrink-0 w-8 h-8`;
  if (icon === 'circle') return (
    <div className={base}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-tertiary">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="7" cy="7" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
  if (icon === 'half-moon') return (
    <div className={base}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-tertiary">
        <path d="M7 1.5a5.5 5.5 0 0 1 0 11V1.5Z" fill="currentColor" fillOpacity="0.4" />
        <path d="M7 1.5a5.5 5.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M7 1.5a5.5 5.5 0 0 0 0 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
  return (
    <div className={base}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="text-tertiary">
        <path d="M6 0.5L11.5 6L6 11.5L0.5 6L6 0.5Z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-5 h-px bg-tertiary" />
      <span className="font-mono text-xs uppercase tracking-widest text-tertiary">{text}</span>
    </div>
  );
}

// ─── Availability dashes ──────────────────────────────────────────────────────

function AvailabilityDashes({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`h-1 w-6 rounded-full ${i <= level ? 'bg-accent-gold' : 'bg-surface'}`} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MemberAstrologyTab({ member }: MemberAstrologyTabProps) {
  const data = getEmotionalAstrologyDataForMember(member.id);
  const firstName = member.fullName.split(' ')[0]; // used in dynamic sub-labels

  return (
    <div className="w-full max-w-none space-y-8">

      {/* ── Moon Sign + Moon Nakshatra ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent-ai/8 border border-primary/30 border-l-4 border-l-accent-ai rounded-2xl px-5 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-accent-ai/50" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent-ai">Moon Sign</span>
          </div>
          <p className="font-serif text-2xl text-primary">{data.moonSign.name}</p>
          <p className="font-mono text-xs text-tertiary tracking-wider">
            {data.moonSign.element} · {data.moonSign.tagline}
          </p>
        </div>
        <div className="bg-accent-ai/8 border border-primary/30 border-l-4 border-l-accent-ai rounded-2xl px-5 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-accent-ai/50" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent-ai">Moon Nakshatra</span>
          </div>
          <p className="font-serif text-2xl text-primary">{data.moonNakshatra.name}</p>
          <p className="font-mono text-xs text-tertiary tracking-wider">{data.moonNakshatra.deity}</p>
        </div>
      </div>

      {/* ── Essence Quote ── */}
      <div className="bg-accent-ai/8 border border-accent-ai/20 rounded-2xl px-6 py-4">
        <p className="font-serif text-lg italic text-accent-ai leading-relaxed">
          &ldquo;{data.essenceQuote}&rdquo;
        </p>
      </div>

      {/* ── Their Emotional Nature ── */}
      <div className="space-y-4">
        <SectionLabel text="Their Emotional Nature" />
        <p className="font-serif text-base text-primary leading-relaxed">
          {data.emotionalNature.summary}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-accent-primary/8 border border-primary/30 rounded-2xl px-5 py-4 space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-accent-primary">
              What Makes Them Feel Safe
            </p>
            <p className="font-serif text-base text-primary leading-relaxed">
              {data.emotionalNature.whatMakesThemSafe}
            </p>
          </div>
          <div className="bg-error/8 border border-primary/30 rounded-2xl px-5 py-4 space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-error">
              What Triggers Withdrawal
            </p>
            <p className="font-serif text-base text-primary leading-relaxed">
              {data.emotionalNature.whatTriggersWithdrawal}
            </p>
          </div>
        </div>
        <div className="bg-accent-gold/8 border border-primary/30 rounded-2xl px-5 py-4 space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-gold">
            Their Emotional Gift
          </p>
          <p className="font-serif text-base text-primary leading-relaxed">
            {data.emotionalNature.emotionalGift}
          </p>
        </div>
      </div>

      <DottedDivider />

      {/* ── When Things Go Wrong ── */}
      <div className="bg-accent-secondary/8 border border-primary/30 border-l-4 border-l-accent-secondary rounded-2xl px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-accent-secondary/50" />
            <span className="font-mono text-xs uppercase tracking-widest text-tertiary">
              When Things Go Wrong
            </span>
          </div>
          <button className="px-3 py-1 border border-primary/30 rounded-full font-mono text-xs uppercase tracking-widest text-tertiary hover:bg-surface transition-colors duration-200">
            How to Respond
          </button>
        </div>
        <p className="font-serif text-lg text-primary leading-relaxed">
          {data.whenThingsGoWrong.description}
        </p>
        <p className="font-serif text-base italic leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          {data.whenThingsGoWrong.howToRespond}
        </p>
      </div>

      <DottedDivider />

      {/* ── Emotional Availability — Right Now ── */}
      <div className="bg-surface border border-primary/30 rounded-2xl px-5 py-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-tertiary" />
          <span className="font-mono text-xs uppercase tracking-widest text-tertiary">
            Emotional Availability — Right Now
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AvailabilityDashes level={data.emotionalAvailability.level} />
          <span className="font-serif text-base italic text-accent-gold">
            {data.emotionalAvailability.label}
          </span>
        </div>
        <p className="font-serif text-base text-primary leading-relaxed">
          {data.emotionalAvailability.description}
        </p>
        <div className="bg-secondary border border-primary/15 rounded-xl px-4 py-3 space-y-1.5">
          <p className="font-mono text-xs uppercase tracking-widest text-tertiary">
            For Your Interactions
          </p>
          <p className="font-serif text-base italic leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            {data.emotionalAvailability.forYourInteractions}
          </p>
        </div>
      </div>

      <DottedDivider />

      {/* ── What This Relationship Asks of You ── */}
      <div className="bg-accent-ai/5 border border-primary/30 border-l-4 border-l-accent-ai rounded-2xl px-5 py-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-accent-ai/50" />
          <span className="font-mono text-xs uppercase tracking-widest text-tertiary">
            What This Relationship Asks of You
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <TipIconBox icon="circle" />
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-widest text-accent-primary">
                What Lands Well
              </p>
              <p className="font-serif text-base text-primary leading-relaxed">
                {data.relationshipDynamic.whatLandsWell}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TipIconBox icon="half-moon" />
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-widest text-accent-secondary">
                Where Friction Lives
              </p>
              <p className="font-serif text-base text-primary leading-relaxed">
                {data.relationshipDynamic.whereFrictionLives}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-secondary border border-primary/15 rounded-xl px-4 py-3 space-y-1.5">
          <p className="font-mono text-xs uppercase tracking-widest text-tertiary">
            The Adjustment — with {firstName}
          </p>
          <p className="font-serif text-base italic leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            {data.relationshipDynamic.theAdjustment}
          </p>
        </div>
      </div>

      <DottedDivider />

      {/* ── How To Meet Them Well ── */}
      <div className="space-y-4">
        <SectionLabel text="How to Meet Them Well" />
        <div className="space-y-0">
          {data.howToMeetThemWell.tips.map((tip, i) => (
            <div key={i}>
              {i > 0 && <DottedDivider style={{ marginTop: 12, marginBottom: 12 }} />}
              <div className="flex items-start gap-3 py-1">
                <TipIconBox icon={tip.icon} />
                <div className="space-y-0.5">
                  <p className="font-serif text-base text-primary">{tip.title}</p>
                  <p className="font-serif text-base italic leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-accent-primary/8 border border-primary/30 rounded-2xl px-5 py-4 space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-accent-primary">
              Best Moment to Approach
            </p>
            <p className="font-serif text-base text-primary leading-relaxed">
              {data.howToMeetThemWell.bestMoment}
            </p>
          </div>
          <div className="bg-error/8 border border-primary/30 rounded-2xl px-5 py-4 space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-error">
              Avoid When
            </p>
            <p className="font-serif text-base text-primary leading-relaxed">
              {data.howToMeetThemWell.avoidWhen}
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer disclaimer ── */}
      <DottedDivider />
      <p className="font-serif text-xs italic text-tertiary leading-relaxed pt-2">
        <span className="mr-1.5">⊙</span>
        Astrological context is one lens among several. Use this alongside Traits, Patterns,
        and your own lived interactions — not instead of them.
      </p>

    </div>
  );
}
