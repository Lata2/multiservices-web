import type { ReactNode } from 'react';
import { useGoBack } from '@/hooks/useGoBack';
import { cn, HUES, IconButton, type Hue, type IconName } from '../ui';
import type { SceneKey } from '@/constants/visuals';
import { Scene } from './Scenes';
import { ServiceArt } from './ServiceArt';

/**
 * Colourful page banner for public listing pages (explore, category, offers…).
 * Replaces the plain title row: title, one short line, optional back/actions and a slot
 * for a search box — with the brand illustration on larger screens.
 */
export function PageHero({
  title,
  subtitle,
  icon,
  hue = 'primary',
  satellites = [],
  scene,
  back,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  icon: IconName;
  hue?: Hue;
  satellites?: IconName[];
  /** Illustrated scene shown as a framed picture on tablet/desktop (instead of the icon art). */
  scene?: SceneKey;
  /** Fallback route for the back button (shown when set). */
  back?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const goBack = useGoBack(back ?? '/');
  return (
    <section className={cn('relative isolate mb-5 overflow-hidden rounded-[24px] px-5 pb-6 pt-4 text-white shadow-md sm:min-h-[208px] sm:px-8 sm:pb-8 sm:pt-6 lg:mb-8', HUES[hue].bold, className)}>
      <span className="dot-grid absolute inset-0 -z-10 opacity-10" aria-hidden />
      <span className="absolute -bottom-24 -left-10 -z-10 h-56 w-56 rounded-full bg-white/10 blur-xl" aria-hidden />
      {scene ? (
        <span className="absolute right-6 top-1/2 -z-10 hidden aspect-[4/3] w-[34%] max-w-[300px] -translate-y-1/2 rotate-[1.5deg] overflow-hidden rounded-2xl shadow-float ring-1 ring-white/40 sm:block lg:right-10">
          <Scene scene={scene} hue={hue} />
        </span>
      ) : (
        <ServiceArt icon={icon} hue={hue} satellites={satellites} animated={false} className="absolute right-2 top-1/2 -z-10 hidden w-44 -translate-y-1/2 sm:block lg:right-10 lg:w-52" />
      )}
      {back || actions ? (
        <div className={cn('mb-3 flex items-center justify-between gap-2 sm:mb-4', scene && 'sm:justify-start')}>
          {back ? <IconButton icon="chevron-left" label="Go back" variant="glass" onClick={goBack} /> : <span />}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : (
        <div className="h-2 sm:h-1" />
      )}
      <div className="relative max-w-xl sm:max-w-[58%]">
        <h1 className="text-h1 font-extrabold sm:text-display">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-body-sm text-white/85 sm:text-body">{subtitle}</p> : null}
        {children ? <div className="mt-4 sm:mt-5">{children}</div> : null}
      </div>
    </section>
  );
}
