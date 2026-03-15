'use client';

interface ProfileHeaderProps {
  user: {
    first_name?: string;
    last_name?: string;
    email: string;
    avatar_url?: string;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const displayName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.email;

  return (
    <div className="bg-lumis-surface rounded-xl p-6 border border-lumis-text-tertiary/10">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-lumis-accent-primary/20 rounded-full flex items-center justify-center">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-serif text-lumis-accent-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-serif text-lumis-text-primary mb-1">
            {displayName}
          </h2>
          <p className="text-lumis-text-secondary text-sm">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}