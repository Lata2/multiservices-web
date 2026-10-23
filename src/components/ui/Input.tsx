import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from './cn';
import { Icon, type IconName } from './Icon';

interface FieldShellProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  id: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, error, hint, required, id, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="text-body-sm font-medium text-ink-secondary">
          {label}
          {required ? <span className="text-danger-600"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1 text-caption text-danger-600">
          <Icon name="alert" size={13} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-caption text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const controlClasses = (error?: string, disabled?: boolean) =>
  cn(
    'flex w-full items-center rounded-lg border bg-surface px-3.5 text-ink transition-[border-color,box-shadow] duration-150',
    'focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100',
    error ? 'border-danger-500' : 'border-border hover:border-border-strong',
    disabled && 'bg-surface-muted opacity-80',
  );

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: IconName;
  prefix?: string;
  right?: ReactNode;
  containerClassName?: string;
  onValueChange?: (v: string) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, prefix, right, containerClassName, type = 'text', required, id: idProp, disabled, onChange, onValueChange, className, ...rest },
  ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={containerClassName}>
      <div className={cn(controlClasses(error, disabled), 'h-11')}>
        {leftIcon ? <Icon name={leftIcon} size={17} className="mr-2.5 text-ink-muted" /> : null}
        {prefix ? <span className="mr-1.5 text-ink-secondary">{prefix}</span> : null}
        <input
          ref={ref}
          id={id}
          type={isPassword && show ? 'text' : type}
          required={required}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn('h-full min-w-0 flex-1 bg-transparent outline-none', className)}
          onChange={(e) => {
            onChange?.(e);
            onValueChange?.(e.target.value);
          }}
          {...rest}
        />
        {isPassword ? (
          <button type="button" onClick={() => setShow((s) => !s)} className="focus-ring -mr-1 rounded p-1 text-ink-muted hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>
            <Icon name={show ? 'eye-off' : 'eye'} size={17} />
          </button>
        ) : null}
        {right}
      </div>
    </Field>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  onValueChange?: (v: string) => void;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, containerClassName, required, id: idProp, rows = 4, onChange, onValueChange, disabled, ...rest },
  ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={containerClassName}>
      <div className={cn(controlClasses(error, disabled), 'py-2.5')}>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          className="min-h-[80px] w-full resize-y bg-transparent outline-none"
          onChange={(e) => {
            onChange?.(e);
            onValueChange?.(e.target.value);
          }}
          {...rest}
        />
      </div>
    </Field>
  );
});

