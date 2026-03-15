'use client';

interface SignOutSectionProps {
  onSignOut: () => Promise<void>;
  isLoading: boolean;
}

export function SignOutSection({ onSignOut, isLoading }: SignOutSectionProps) {
  return (
    <div className="bg-lumis-surface rounded-xl p-6 border border-lumis-text-tertiary/10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif text-lumis-text-primary mb-1">
            Sign Out
          </h3>
          <p className="text-sm text-lumis-text-secondary">
            Your preferences will be remembered when you return.
          </p>
        </div>
        <button
          onClick={onSignOut}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-lumis-accent-secondary/10 text-lumis-accent-secondary border border-lumis-accent-secondary/30 hover:bg-lumis-accent-secondary/20"
        >
          {isLoading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}