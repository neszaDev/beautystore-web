import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
};

/** Labelled input with inline error wired through aria-invalid / aria-describedby. */
export function FormField({ id, label, value, onChange, error, hint, ...rest }: Props) {
  const desc = [error ? `${id}-err` : "", hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {rest.required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={rest.name ?? id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={desc}
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="err">
          {error}
        </p>
      )}
    </div>
  );
}
