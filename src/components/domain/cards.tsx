import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { BOOKING_STATUS, TASK_STATUS } from '@/constants/status';
import type { Address, AppNotification, Booking, Category, DeliveryTask, PromoCode, Provider, Review, Service } from '@/types/models';
import { formatDay, formatDuration, formatMoney, formatTime, timeAgo } from '@/utils/format';
import { discountPercent } from '@/utils/pricing';
import { Avatar, Badge, cn, Icon, RatingPill, RatingStars, type IconName } from '../ui';
import { ServiceThumb } from './ServiceThumb';

/* ───────── Price ───────── */

export function Price({ price, discountPrice, size = 'md' }: { price: number; discountPrice?: number; size?: 'sm' | 'md' | 'lg' }) {
  const main = discountPrice ?? price;
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={cn('font-bold text-ink', size === 'lg' ? 'text-h2' : size === 'sm' ? 'text-body' : 'text-title')}>{formatMoney(main)}</span>
      {discountPrice ? (
        <span className="text-caption text-ink-muted line-through">
          <span className="sr-only">was </span>
          {formatMoney(price)}
        </span>
      ) : null}
    </span>
  );
}

/* ───────── Category ───────── */

export function CategoryTile({ category, index, to }: { category: Category; index: number; to: string }) {
  return (
    <Link to={to} className="focus-ring group flex flex-col items-center gap-2 rounded-xl p-1.5 text-center">
      <span className={cn(`tint-${index % 6}`, 'flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-200 group-hover:-translate-y-0.5 sm:h-16 sm:w-16')}>
        <Icon name={category.icon} size={26} />
      </span>
      <span className="line-clamp-2 text-caption font-medium leading-4 text-ink sm:text-body-sm">{category.name}</span>
    </Link>
  );
}

/* ───────── Service ───────── */

export function ServiceCard({ service, className }: { service: Service; className?: string }) {
  const off = discountPercent(service);
  return (
    <Link
      to={`/service/${service.id}`}
      className={cn('focus-ring group flex flex-col overflow-hidden rounded-card border border-border/80 bg-surface shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-primary-200 hover:shadow-md', className)}
    >
      <div className="relative">
        <ServiceThumb image={service.image} categoryId={service.categoryId} className="h-28 w-full sm:h-32" iconSize={32} />
        {off ? <span className="absolute left-2.5 top-2.5 rounded-md bg-accent-500 px-2 py-0.5 text-2xs font-bold text-white">{off}% OFF</span> : null}
        {service.tags.includes('bestseller') ? <Badge label="Bestseller" tone="primary" icon="flame" className="absolute right-2.5 top-2.5 bg-white" /> : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 min-h-[38px] text-body-sm font-semibold group-hover:text-primary-700">{service.title}</h3>
        <RatingPill rating={service.rating} count={service.reviewCount} />
        <div className="mt-auto flex items-center justify-between pt-1">
          <Price price={service.price} discountPrice={service.discountPrice} size="sm" />
          <span className="text-caption text-ink-muted">{formatDuration(service.durationMin)}</span>
        </div>
      </div>
    </Link>
  );
}

/** Row layout with an optional control on the right (stretched-link pattern keeps nested buttons usable). */
export function ServiceRow({ service, right, providerName }: { service: Service; right?: ReactNode; providerName?: string }) {
  const off = discountPercent(service);
  return (
    <article className="group relative flex gap-3.5 rounded-card border border-border/80 bg-surface p-3 shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-primary-200 hover:shadow-md">
      <ServiceThumb image={service.image} categoryId={service.categoryId} className="h-20 w-20 rounded-lg sm:h-24 sm:w-24" iconSize={28} />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 font-semibold">
            <Link to={`/service/${service.id}`} className="focus-ring rounded after:absolute after:inset-0 after:rounded-card group-hover:text-primary-700">
              {service.title}
            </Link>
          </h3>
          {providerName ? <p className="mt-0.5 truncate text-caption text-ink-muted">by {providerName}</p> : null}
          <div className="mt-1 flex items-center gap-2">
            <RatingPill rating={service.rating} count={service.reviewCount} />
            <span className="text-caption text-ink-muted">{formatDuration(service.durationMin)}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Price price={service.price} discountPrice={service.discountPrice} size="sm" />
            {off ? <Badge label={`${off}% off`} tone="accent" /> : null}
          </div>
          {right ? <div className="relative z-10">{right}</div> : null}
        </div>
      </div>
    </article>
  );
}

/* ───────── Provider ───────── */

export function ProviderCard({ provider, compact, className }: { provider: Provider; compact?: boolean; className?: string }) {
  const to = `/professionals/${provider.id}`;
  if (compact) {
    return (
      <Link to={to} className={cn('focus-ring flex flex-col items-center rounded-card border border-border/80 bg-surface p-4 text-center shadow-sm transition-[box-shadow,border-color] hover:border-primary-200 hover:shadow-md', className)}>
        <Avatar src={provider.avatar} name={provider.businessName} size={60} />
        <span className="mt-2.5 flex max-w-full items-center gap-1">
          <span className="truncate text-body-sm font-semibold">{provider.businessName}</span>
          {provider.verified ? <Icon name="verified" size={14} className="text-primary-500" label="Verified" /> : null}
        </span>
        <RatingPill rating={provider.rating} count={provider.reviewCount} className="mt-1" />
        <span className="mt-1 text-caption text-ink-muted">
          {provider.distanceKm} km away · from {formatMoney(provider.startingPrice)}
        </span>
      </Link>
    );
  }
  return (
    <Link to={to} className={cn('focus-ring flex items-center gap-3.5 rounded-card border border-border/80 bg-surface p-4 shadow-sm transition-[box-shadow,border-color] hover:border-primary-200 hover:shadow-md', className)}>
      <Avatar src={provider.avatar} name={provider.businessName} size={56} rounded="lg" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="truncate font-semibold">{provider.businessName}</span>
          {provider.verified ? <Icon name="verified" size={15} className="text-primary-500" label="Verified" /> : null}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2">
          <RatingPill rating={provider.rating} count={provider.reviewCount} />
          <span className="text-caption text-ink-muted">
            {provider.jobsCompleted.toLocaleString('en-IN')} jobs · {provider.distanceKm} km
          </span>
        </span>
        <span className="mt-1 block text-caption text-ink-secondary">
          {provider.type === 'organization' ? 'Organisation' : 'Individual'} · from {formatMoney(provider.startingPrice)}
        </span>
      </span>
      <Icon name="chevron-right" size={17} className="text-ink-muted" />
    </Link>
  );
}

/* ───────── Booking ───────── */

export function BookingStatusBadge({ status, size = 'sm' }: { status: Booking['status']; size?: 'sm' | 'md' }) {
  const s = BOOKING_STATUS[status];
  return <Badge label={s.label} tone={s.tone} icon={s.icon} size={size} />;
}

export function BookingCard({ booking, to, perspective = 'customer', footer }: { booking: Booking; to: string; perspective?: 'customer' | 'provider' | 'admin'; footer?: ReactNode }) {
  const first = booking.items[0];
  const more = booking.items.length - 1;
  return (
    <article className="relative flex flex-col gap-3 rounded-card border border-border/80 bg-surface p-4 shadow-sm transition-[box-shadow,border-color] hover:border-primary-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-medium text-ink-muted">#{booking.code}</span>
        <BookingStatusBadge status={booking.status} />
      </div>
      <div className="flex gap-3">
        <ServiceThumb categoryId={first.categoryId} image={first.image} className="h-12 w-12 rounded-lg" iconSize={20} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">
            <Link to={to} className="focus-ring rounded after:absolute after:inset-0 after:rounded-card">
              {first.title}
              {first.quantity > 1 ? ` × ${first.quantity}` : ''}
            </Link>
          </h3>
          {more > 0 ? <p className="text-caption text-ink-muted">+ {more} more service{more > 1 ? 's' : ''}</p> : null}
          <p className="mt-0.5 truncate text-body-sm text-ink-secondary">
            {perspective === 'customer' ? booking.providerName : perspective === 'provider' ? booking.customerName : `${booking.customerName} → ${booking.providerName}`}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2.5">
        <span className="flex items-center gap-1.5 text-body-sm font-medium">
          <Icon name="calendar" size={14} className="text-ink-secondary" />
          {formatDay(booking.scheduledDate)} · {formatTime(booking.slot)}
        </span>
        <span className="text-body-sm font-bold">{formatMoney(booking.pricing.total)}</span>
      </div>
      {footer ? <div className="relative z-10">{footer}</div> : null}
    </article>
  );
}

/* ───────── Address ───────── */

export function AddressCard({ address, selected, onSelect, right }: { address: Address; selected?: boolean; onSelect?: () => void; right?: ReactNode }) {
  const icon: IconName = address.label === 'Home' ? 'home' : address.label === 'Work' ? 'briefcase' : 'pin';
  const body = (
    <>
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', selected ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-600')}>
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className="font-semibold">{address.label}</span>
          {address.isDefault ? <Badge label="Default" tone="success" /> : null}
        </span>
        <span className="mt-1 block text-body-sm text-ink-secondary">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}
        </span>
        <span className="block text-body-sm text-ink-secondary">
          {address.city}, {address.state} {address.pincode}
        </span>
        <span className="mt-1 block text-caption text-ink-muted">
          {address.contactName} · {address.phone}
        </span>
      </span>
      {right ?? (onSelect ? <Icon name={selected ? 'radio-on' : 'circle'} size={21} className={selected ? 'text-primary-500' : 'text-ink-muted'} /> : null)}
    </>
  );
  const cls = cn('flex w-full gap-3 rounded-card border bg-surface p-4 shadow-sm transition-colors', selected ? 'border-2 border-primary-500 bg-primary-50/40' : 'border-border/80');
  return onSelect ? (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={cn(cls, 'focus-ring hover:border-primary-300')}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/* ───────── Review ───────── */

export function ReviewCard({ review, onReply, serviceTitle, className }: { review: Review; onReply?: () => void; serviceTitle?: string; className?: string }) {
  return (
    <article className={cn('flex flex-col gap-2 border-b border-border py-4 last:border-b-0', className)}>
      <div className="flex items-center gap-3">
        <Avatar src={review.customerAvatar} name={review.customerName} size={38} />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold">{review.customerName}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <RatingStars value={review.rating} size={12} />
            <time className="text-caption text-ink-muted" dateTime={review.createdAt}>
              {timeAgo(review.createdAt)}
            </time>
          </div>
        </div>
      </div>
      {serviceTitle ? <p className="text-caption font-medium text-primary-600">{serviceTitle}</p> : null}
      <p className="text-body-sm leading-6 text-ink-secondary">{review.comment}</p>
      {review.reply ? (
        <div className="ml-4 rounded-lg border-l-2 border-primary-300 bg-primary-50 p-3">
          <p className="text-caption font-semibold text-primary-600">Provider response</p>
          <p className="mt-1 text-body-sm text-ink-secondary">{review.reply.text}</p>
        </div>
      ) : onReply ? (
        <button type="button" onClick={onReply} className="focus-ring flex items-center gap-1 self-start rounded text-caption font-semibold text-primary-600 hover:underline">
          <Icon name="reply" size={13} />
          Reply
        </button>
      ) : null}
    </article>
  );
}

/* ───────── Promo ───────── */

export function PromoCard({ promo, onApply, applied, className }: { promo: PromoCode; onApply?: () => void; applied?: boolean; className?: string }) {
  return (
    <div className={cn('flex overflow-hidden rounded-card border border-dashed border-accent-300 bg-accent-50', className)}>
      <div className="flex w-16 shrink-0 flex-col items-center justify-center bg-accent-500 text-white">
        <span className="text-title font-black">{promo.discountType === 'percent' ? `${promo.value}%` : `₹${promo.value}`}</span>
        <span className="text-2xs font-semibold">OFF</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md border border-accent-400 bg-surface px-2 py-0.5 text-caption font-bold tracking-widest text-accent-700">{promo.code}</span>
          {onApply ? (
            <button type="button" onClick={onApply} disabled={applied} className={cn('focus-ring rounded px-1 text-body-sm font-bold', applied ? 'text-success-600' : 'text-primary-600 hover:underline')}>
              {applied ? 'Applied' : 'Apply'}
            </button>
          ) : null}
        </div>
        <p className="text-body-sm font-semibold">{promo.title}</p>
        <p className="text-caption text-ink-secondary">{promo.description}</p>
        <p className="text-caption text-ink-muted">
          Valid till {formatDay(promo.expiresAt)}
          {promo.minOrder ? ` · Min order ${formatMoney(promo.minOrder)}` : ''}
        </p>
      </div>
    </div>
  );
}

/* ───────── Notification ───────── */

const notifIcon: Record<AppNotification['type'], { icon: IconName; tint: string }> = {
  booking: { icon: 'calendar', tint: 'tint-0' },
  promo: { icon: 'tag', tint: 'tint-1' },
  payment: { icon: 'card', tint: 'tint-2' },
  system: { icon: 'info', tint: 'tint-5' },
  task: { icon: 'bike', tint: 'tint-3' },
  review: { icon: 'star', tint: 'bg-warning-50 text-warning-600' },
};

export function NotificationItem({ item, onOpen }: { item: AppNotification; onOpen: () => void }) {
  const v = notifIcon[item.type];
  return (
    <button type="button" onClick={onOpen} className={cn('focus-ring flex w-full gap-3 rounded-card px-4 py-3.5 text-left transition-colors hover:bg-surface-muted/70', !item.read && 'bg-primary-50/60')}>
      <span className={cn(v.tint, 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full')}>
        <Icon name={v.icon} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cn('flex-1 text-body-sm', item.read ? 'font-medium' : 'font-bold')}>{item.title}</span>
          <time className="shrink-0 text-caption text-ink-muted" dateTime={item.createdAt}>
            {timeAgo(item.createdAt)}
          </time>
        </span>
        <span className="mt-0.5 block text-body-sm text-ink-secondary">{item.body}</span>
      </span>
      {!item.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-label="Unread" /> : null}
    </button>
  );
}

/* ───────── Delivery task ───────── */

const taskIcon: Record<DeliveryTask['type'], IconName> = { pickup: 'arrow-out', drop: 'arrow-in', parts: 'package' };

export function TaskCard({ task, to, footer }: { task: DeliveryTask; to: string; footer?: ReactNode }) {
  const s = TASK_STATUS[task.status];
  return (
    <article className="relative flex flex-col gap-3 rounded-card border border-border/80 bg-surface p-4 shadow-sm transition-[box-shadow,border-color] hover:border-primary-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2">
          <Icon name={taskIcon[task.type]} size={17} className="text-primary-500" />
          <Link to={to} className="focus-ring rounded font-semibold capitalize after:absolute after:inset-0 after:rounded-card">
            {task.type === 'parts' ? 'Parts delivery' : `${task.type} task`}
          </Link>
          <span className="text-caption text-ink-muted">#{task.bookingCode}</span>
        </h3>
        <Badge label={s.label} tone={s.tone} />
      </div>
      <div className="flex flex-col gap-2">
        <StopRow kind="from" name={task.pickup.name} address={task.pickup.address} />
        <span className="ml-[9px] h-3 w-px bg-border-strong" aria-hidden />
        <StopRow kind="to" name={task.drop.name} address={task.drop.address} />
      </div>
      <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
        <span className="text-caption text-ink-secondary">
          {task.distanceKm} km · {formatTime(new Date(task.scheduledFor).toTimeString().slice(0, 5))}
          {task.codAmount ? ` · Collect ${formatMoney(task.codAmount)}` : ''}
        </span>
        <span className="font-bold text-success-600">{formatMoney(task.fee)}</span>
      </div>
      {footer ? <div className="relative z-10">{footer}</div> : null}
    </article>
  );
}

export function StopRow({ kind, name, address }: { kind: 'from' | 'to'; name: string; address: string }) {
  return (
    <div className="flex gap-2.5">
      <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', kind === 'from' ? 'bg-primary-100' : 'bg-success-100')}>
        <span className={cn('h-2 w-2 rounded-full', kind === 'from' ? 'bg-primary-500' : 'bg-success-500')} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold">{name}</p>
        <p className="line-clamp-2 text-caption text-ink-secondary">{address}</p>
      </div>
    </div>
  );
}
