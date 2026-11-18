import { forwardRef, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';

interface FieldShellProps {
  id: string;
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

function FieldShell({ id, label, required, error, hint, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-ink">
          {label}
          {required && <span className="text-danger-ink"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-message`} className="text-[11px] font-medium text-danger-ink">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-message`} className="text-[11px] font-medium text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const controlClasses = (hasError: boolean, dark: boolean) =>
  cn(
    'h-12 w-full rounded-2xl border px-4 text-sm font-medium outline-none transition',
    dark
      ? 'border-ink-line bg-ink-soft text-white placeholder:text-on-dark-faint focus:border-lime'
      : 'border-transparent bg-canvas text-ink placeholder:text-muted-light focus:border-lime',
    hasError && 'border-danger focus:border-danger',
  );

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
  dark?: boolean;
  containerClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, trailing, dark = false, required, containerClassName, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldShell
      id={inputId}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={containerClassName}
    >
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${inputId}-message` : undefined}
          className={cn(controlClasses(Boolean(error), dark), trailing && 'pr-16', className)}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-4 flex items-center">{trailing}</div>}
      </div>
    </FieldShell>
  );
});

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, required, containerClassName, className, id, children, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FieldShell
      id={selectId}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={containerClassName}
    >
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        className={cn(controlClasses(Boolean(error), false), 'select-chevron', className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
});
