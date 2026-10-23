import { NavLink } from 'react-router';
import { cn, Icon, type IconName } from '../ui';

export interface TabItem {
  to: string;
  label: string;
  icon: IconName;
  badge?: number;
  end?: boolean;
}

/** Mobile/tablet bottom tab bar — mirrors the app's role tabs. Hidden on desktop. */
export function BottomTabs({ tabs }: { tabs: TabItem[] }) {
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(17_23_41/0.06)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex h-16 max-w-xl items-stretch">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.end ?? true}
              className={({ isActive }) => cn('focus-ring flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors', isActive ? 'text-primary-600' : 'text-ink-muted hover:text-ink')}
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <span className={cn('flex h-7 w-12 items-center justify-center rounded-full transition-colors', isActive && 'bg-primary-50')}>
                      <Icon name={t.icon} size={21} strokeWidth={isActive ? 2.3 : 1.9} />
                    </span>
                    {t.badge ? <span className="absolute -right-0.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">{t.badge > 9 ? '9+' : t.badge}</span> : null}
                  </span>
                  {t.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
