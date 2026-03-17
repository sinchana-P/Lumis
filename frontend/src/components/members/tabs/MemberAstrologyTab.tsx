'use client';

import { DottedDivider } from '@/components/ui/DottedDivider';
import {
  useGetMemberAstrologyQuery,
  useGetMyAstrologyQuery,
  type AstrologyProfile,
} from '@/store/api/astrologyApi';

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
  isUser?: boolean;
  isExternalLoading?: boolean;
  externalError?: string | null;
}

// ─── Sign element + tagline map ───────────────────────────────────────────────

const SIGN_ELEMENT: Record<string, { element: string; tagline: string }> = {
  'Mesha':     { element: 'Fire',  tagline: 'The Ram — Initiation' },
  'Vrishabha': { element: 'Earth', tagline: 'The Bull — Stability' },
  'Mithuna':   { element: 'Air',   tagline: 'The Twins — Duality' },
  'Karkata':   { element: 'Water', tagline: 'The Crab — Nurturing' },
  'Simha':     { element: 'Fire',  tagline: 'The Lion — Expression' },
  'Kanya':     { element: 'Earth', tagline: 'The Maiden — Discernment' },
  'Tula':      { element: 'Air',   tagline: 'The Scales — Harmony' },
  'Vrischika': { element: 'Water', tagline: 'The Scorpion — Intensity' },
  'Dhanu':     { element: 'Fire',  tagline: 'The Archer — Expansion' },
  'Makara':    { element: 'Earth', tagline: 'The Goat — Discipline' },
  'Kumbha':    { element: 'Air',   tagline: 'The Water Bearer — Vision' },
  'Meena':     { element: 'Water', tagline: 'The Fish — Dissolution' },
};

function getSignInfo(sign: string) {
  const key = sign.split(' ')[0];
  return SIGN_ELEMENT[key] ?? { element: '', tagline: sign };
}

function availabilityLevel(label: string): 1 | 2 | 3 {
  if (['Reaching outward', 'Expansive and open', 'Deeply receptive'].includes(label)) return 3;
  if (label === 'In transition') return 2;
  return 1;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type TipIcon = 'circle' | 'half-moon' | 'diamond';

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

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-5 h-px bg-tertiary" />
      <span className="font-mono text-xs uppercase tracking-widest text-tertiary">{text}</span>
    </div>
  );
}

function AvailabilityDashes({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`h-1 w-6 rounded-full ${i <= level ? 'bg-accent-gold' : 'bg-surface'}`} />
      ))}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 rounded-2xl bg-surface" />
        <div className="h-28 rounded-2xl bg-surface" />
      </div>
      <div className="h-16 rounded-2xl bg-surface" />
      <div className="h-40 rounded-2xl bg-surface" />
      <div className="h-32 rounded-2xl bg-surface" />
    </div>
  );
}

// ─── Empty / missing data state ───────────────────────────────────────────────

function EmptyState({ member, isUser, error }: { member: Member; isUser: boolean; error?: string | null }) {
  const hasRequiredData = member.dateOfBirth && member.timeOfBirth && member.placeOfBirth;
  const firstName = member.fullName.split(' ')[0];

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ background: 'color-mix(in srgb, var(--accent-ai) 15%, transparent)' }}>
        <svg className="w-7 h-7" style={{ color: 'var(--accent-ai)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      <h3 className="font-serif text-2xl font-light mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        No astrology reading yet
      </h3>
      <p className="font-serif text-base font-light max-w-xs" style={{ color: 'var(--text-tertiary)' }}>
        {hasRequiredData
          ? `Generate ${isUser ? 'your' : `${firstName}'s`} full Vedic reading — moon sign, nakshatra, dasha, and emotional patterns.`
          : `Add ${isUser ? 'your' : `${firstName}'s`} birth date, time, and place to unlock their Vedic astrology reading.`}
      </p>
      {error && <p className="font-mono text-xs mt-3" style={{ color: 'var(--error)' }}>{error}</p>}
    </div>
  );
}

// ─── Data view ────────────────────────────────────────────────────────────────

function AstrologyDataView({ profile, firstName }: { profile: AstrologyProfile; firstName: string }) {
  const { computed, insights } = profile;
  const moonSignInfo = getSignInfo(computed.moonSign);
  const availLevel = availabilityLevel(insights.emotionalAvailability);

  return (
    <div className="w-full max-w-none space-y-8">

      {/* ── Moon Sign + Nakshatra ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent-ai/8 border border-primary/30 border-l-4 border-l-accent-ai rounded-2xl px-5 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-accent-ai/50" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent-ai">Moon Sign</span>
          </div>
          <p className="font-serif text-2xl text-primary">{computed.moonSign}</p>
          <p className="font-mono text-xs text-tertiary tracking-wider">
            {moonSignInfo.element}{moonSignInfo.element ? ' · ' : ''}{moonSignInfo.tagline}
          </p>
        </div>
        <div className="bg-accent-ai/8 border border-primary/30 border-l-4 border-l-accent-ai rounded-2xl px-5 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-accent-ai/50" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent-ai">Moon Nakshatra</span>
          </div>
          <p className="font-serif text-2xl text-primary">{computed.nakshatra}</p>
          <p className="font-mono text-xs text-tertiary tracking-wider">
            Lord: {computed.nakshatraLord} · Pada {computed.nakshatraPada}
          </p>
        </div>
      </div>

      {/* ── Planetary Signatures (as essence) ── */}
      <div className="bg-accent-ai/8 border border-accent-ai/20 rounded-2xl px-6 py-4">
        <p className="font-serif text-base italic text-accent-ai leading-relaxed">
          {insights.planetarySignatures}
        </p>
      </div>

      {/* ── Their Emotional Nature ── */}
      <div className="space-y-4">
        <SectionLabel text="Their Emotional Nature" />
        <p className="font-serif text-base text-primary leading-relaxed">
          {insights.emotionalNature}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-accent-primary/8 border border-primary/30 rounded-2xl px-5 py-4 space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-accent-primary">
              What Makes Them Feel Safe
            </p>
            <p className="font-serif text-base text-primary leading-relaxed">
              {insights.whatMakesThemFeelSafe}
            </p>
          </div>
          <div className="bg-error/8 border border-primary/30 rounded-2xl px-5 py-4 space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-error">
              What Triggers Withdrawal
            </p>
            <p className="font-serif text-base text-primary leading-relaxed">
              {insights.whatTriggersWithdrawal}
            </p>
          </div>
        </div>
        <div className="bg-accent-gold/8 border border-primary/30 rounded-2xl px-5 py-4 space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-gold">
            Their Emotional Gift
          </p>
          <p className="font-serif text-base text-primary leading-relaxed">
            {insights.emotionalGift}
          </p>
        </div>
      </div>

      <DottedDivider />

      {/* ── When Things Go Wrong ── */}
      <div className="bg-accent-secondary/8 border border-primary/30 border-l-4 border-l-accent-secondary rounded-2xl px-5 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-accent-secondary/50" />
          <span className="font-mono text-xs uppercase tracking-widest text-tertiary">
            When Things Go Wrong
          </span>
        </div>
        <p className="font-serif text-lg text-primary leading-relaxed">
          {insights.whenThingsGoWrong}
        </p>
      </div>

      <DottedDivider />

      {/* ── Emotional Availability ── */}
      <div className="bg-surface border border-primary/30 rounded-2xl px-5 py-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-tertiary" />
          <span className="font-mono text-xs uppercase tracking-widest text-tertiary">
            Emotional Availability — Right Now
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AvailabilityDashes level={availLevel} />
          <span className="font-serif text-base italic text-accent-gold">
            {insights.emotionalAvailability}
          </span>
        </div>
        <p className="font-serif text-base text-primary leading-relaxed">
          {insights.emotionalAvailabilityDetail}
        </p>
        <div className="bg-secondary border border-primary/15 rounded-xl px-4 py-3 space-y-1.5">
          <p className="font-mono text-xs uppercase tracking-widest text-tertiary">
            For Your Interactions
          </p>
          <p className="font-serif text-base italic leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            {insights.relationshipGuidance.whatThisRelationshipAsksOfYou}
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
                {insights.relationshipGuidance.whatLandsWell}
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
                {insights.relationshipGuidance.whereFrictionLives}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-secondary border border-primary/15 rounded-xl px-4 py-3 space-y-1.5">
          <p className="font-mono text-xs uppercase tracking-widest text-tertiary">
            The Adjustment — with {firstName}
          </p>
          <p className="font-serif text-base italic leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            {insights.relationshipGuidance.howToMeetThemWell}
          </p>
        </div>
      </div>

      <DottedDivider />

      {/* ── How To Meet Them Well ── */}
      <div className="space-y-4">
        <SectionLabel text="How to Meet Them Well" />
        <div className="space-y-0">
          {[
            { icon: 'circle' as TipIcon, title: 'Best Moment to Approach', description: insights.relationshipGuidance.bestMomentToApproach },
            { icon: 'half-moon' as TipIcon, title: 'Avoid When', description: insights.relationshipGuidance.avoidWhen },
          ].map((tip, i) => (
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
              Ascendant
            </p>
            <p className="font-serif text-base text-primary leading-relaxed">
              {computed.ascendant}
            </p>
          </div>
          <div className="bg-accent-gold/8 border border-primary/30 rounded-2xl px-5 py-4 space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-accent-gold">
              Sun Sign
            </p>
            <p className="font-serif text-base text-primary leading-relaxed">
              {computed.sunSign}
            </p>
          </div>
        </div>
      </div>

      <DottedDivider />

      {/* ── Dasha Influence ── */}
      <div className="bg-surface border border-primary/30 rounded-2xl px-5 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-tertiary" />
          <span className="font-mono text-xs uppercase tracking-widest text-tertiary">
            Current Dasha · {computed.dasha.currentMahadasha.planet} / {computed.dasha.currentAntardasha.planet}
          </span>
        </div>
        <p className="font-serif text-base text-primary leading-relaxed">
          {insights.dashaInfluence}
        </p>
      </div>

      {/* ── Footer ── */}
      <DottedDivider />
      <p className="font-serif text-xs italic text-tertiary leading-relaxed pt-2">
        <span className="mr-1.5">⊙</span>
        Astrological context is one lens among several. Use this alongside Traits, Patterns,
        and your own lived interactions — not instead of them.
      </p>

    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MemberAstrologyTab({ member, isUser = false, isExternalLoading = false, externalError }: MemberAstrologyTabProps) {
  const { data: memberProfile, isLoading: isFetchingMember } = useGetMemberAstrologyQuery(member.id, { skip: isUser });
  const { data: myProfile, isLoading: isFetchingMe } = useGetMyAstrologyQuery(undefined, { skip: !isUser });

  const profile = isUser ? myProfile : memberProfile;
  const isLoading = (isUser ? isFetchingMe : isFetchingMember) || isExternalLoading;
  const firstName = member.fullName.split(' ')[0];

  if (isLoading) return <LoadingSkeleton />;

  if (!profile) {
    return <EmptyState member={member} isUser={isUser} error={externalError} />;
  }

  return <AstrologyDataView profile={profile} firstName={firstName} />;
}
