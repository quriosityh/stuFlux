interface Props {
  activeRole: string;
  setActiveRole: (r: string) => void;
  activePhase: string;
  setActivePhase: (p: string) => void;
}

export function ConversationFilters({ activeRole, setActiveRole, activePhase, setActivePhase }: Props) {
  const roles = ['All', 'As Renter', 'As Lender', 'Unread'];
  const phases = ['All', 'Inquiry', 'Pending', 'Confirmed', 'Ongoing', 'Completed'];

  return (
    <div className="flex flex-col gap-3">
      {/* Tier 1: Roles */}
      <div className="flex justify-between w-full gap-1 py-4 -my-4 items-center">
        {roles.map((role) => (
          <button 
            key={role}
            onClick={() => setActiveRole(role)}
            className={`whitespace-nowrap flex-1 max-w-[90px] text-center py-1 rounded-full text-[11px] font-extrabold transition-all border ${
              activeRole === role 
                ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-sm' 
                : 'bg-surface/40 border-border/10 text-foreground/60 hover:text-foreground hover:border-border/30 font-medium'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Tier 2: Phases */}
      <div className="flex flex-wrap justify-between gap-y-2 gap-x-1 py-4 -my-4 items-center">
        {phases.map((phase) => (
          <button 
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`text-[11px] font-bold transition-all ${
              activePhase === phase 
                ? 'text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent)]' 
                : 'text-[var(--foreground)] opacity-50 hover:opacity-100 font-medium'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>
    </div>
  );
}
