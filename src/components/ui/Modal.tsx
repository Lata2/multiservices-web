import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button, IconButton, type ButtonVariant } from './Button';
import { cn } from './cn';
import { Icon, type IconName } from './Icon';

let openCount = 0;
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** `sheet` slides up from the bottom on phones and becomes a centred dialog on larger screens. */
  variant?: 'sheet' | 'dialog';
  size?: 'sm' | 'md' | 'lg';
  /** Prevent closing while an action is running. */
  locked?: boolean;
  hideClose?: boolean;
  className?: string;
}

/** Accessible modal: portal, focus trap, Escape to close, scroll lock, focus restore. */
export function Modal({ open, onClose, title, subtitle, children, footer, variant = 'sheet', size = 'md', locked, hideClose, className }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const lockedRef = useRef(locked);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
    lockedRef.current = locked;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    openCount += 1;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const el = panel.current;
      if (!el) return;
      const auto = el.querySelector<HTMLElement>('[autofocus],[data-autofocus]');
      (auto ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el).focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !lockedRef.current) {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === 'Tab' && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      openCount -= 1;
      if (openCount <= 0) document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  const width = size === 'sm' ? 'sm:max-w-sm' : size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg';
  return createPortal(
    <div className={cn('fixed inset-0 z-[70] flex justify-center', variant === 'sheet' ? 'items-end sm:items-center sm:p-6' : 'items-center p-4')}>
      <div className="absolute inset-0 animate-fade-in bg-overlay backdrop-blur-[2px]" onClick={() => !locked && onClose()} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[88dvh] w-full flex-col bg-surface shadow-lg outline-none',
          variant === 'sheet' ? 'animate-sheet-up rounded-t-2xl sm:animate-pop-in sm:rounded-2xl' : 'animate-pop-in rounded-2xl',
          width,
          className,
        )}
      >
        {variant === 'sheet' ? <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-neutral-300 sm:hidden" aria-hidden /> : null}
        {title || !hideClose ? (
          <div className="flex shrink-0 items-start gap-3 px-5 pb-2 pt-4">
            <div className="min-w-0 flex-1">
              {title ? (
                <h2 id={titleId} className="text-h3 font-semibold">
                  {title}
                </h2>
              ) : null}
              {subtitle ? <p className="mt-0.5 text-body-sm text-ink-secondary">{subtitle}</p> : null}
            </div>
            {!hideClose ? <IconButton icon="x" label="Close" size="sm" onClick={onClose} disabled={locked} /> : null}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-1">{children}</div>
        {footer ? <div className="shrink-0 border-t border-border px-5 py-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  icon?: IconName;
  tone?: 'primary' | 'danger' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

const toneBg = { primary: 'bg-primary-50 text-primary-600', danger: 'bg-danger-50 text-danger-600', success: 'bg-success-50 text-success-600' };
const toneVariant: Record<string, ButtonVariant> = { primary: 'primary', danger: 'danger', success: 'success' };

export function ConfirmDialog({ open, title, message, icon, tone = 'primary', confirmLabel = 'Confirm', cancelLabel = 'Cancel', loading, confirmDisabled, onConfirm, onCancel, children }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} variant="dialog" size="sm" hideClose locked={loading}>
      <div className="pt-3 text-center">
        {icon ? (
          <div className={cn('mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full', toneBg[tone])}>
            <Icon name={icon} size={26} />
          </div>
        ) : null}
        <h2 className="text-h3 font-semibold">{title}</h2>
        {message ? <p className="mt-2 text-ink-secondary">{message}</p> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={toneVariant[tone]} className="flex-1" onClick={onConfirm} loading={loading} disabled={confirmDisabled}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
