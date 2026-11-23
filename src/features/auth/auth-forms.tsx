"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormField } from "@/components/form-field";
import { useI18n } from "@/components/i18n-provider";
import type { ActionResult } from "@/lib/action";
import { localePath } from "@/lib/locale";
import { confirmPasswordReset, login, register, requestPasswordReset } from "./actions";

function useSubmit() {
  const { err } = useI18n();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  /** Run an action; on failure show the localized code message and server fieldErrors. */
  function submit<T>(fn: () => Promise<ActionResult<T>>, onOk: (data: T) => void) {
    setError(null);
    setFields({});
    start(async () => {
      const res = await fn();
      if (res.ok) onOk(res.data);
      else {
        setError(err(res.code));
        setFields(res.fieldErrors ?? {});
      }
    });
  }
  return { pending, error, fields, submit };
}

const Shell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-md px-4 py-10">
    <h1 className="mb-6 text-3xl">{title}</h1>
    {children}
  </div>
);
const ErrorLine = ({ msg }: { msg: string | null }) => (msg ? <p role="alert" className="err font-semibold">{msg}</p> : null);

export function LoginForm({ next }: { next?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const { pending, error, submit } = useSubmit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Shell title={t.auth.loginTitle}>
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        submit(() => login({ email, password, locale, next }), (d) => { router.replace(d.next); router.refresh(); });
      }}>
        <FormField id="login-email" name="email" type="email" autoComplete="email" required label={t.auth.email} value={email} onChange={setEmail} />
        <FormField id="login-password" name="password" type="password" autoComplete="current-password" required label={t.auth.password} value={password} onChange={setPassword} />
        <ErrorLine msg={error} />
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>{pending ? t.auth.working : t.auth.signIn}</button>
      </form>
      <p className="mt-4"><Link className="underline underline-offset-4" href={localePath(locale, "/forgot-password")}>{t.auth.forgot}</Link></p>
      <p className="mt-2">{t.auth.noAccount} <Link className="font-semibold underline underline-offset-4" href={`${localePath(locale, "/register")}${next ? `?next=${encodeURIComponent(next)}` : ""}`}>{t.auth.register}</Link></p>
    </Shell>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const { pending, error, fields, submit } = useSubmit();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Shell title={t.auth.registerTitle}>
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        submit(() => register({ email, password, fullName, locale, next }), (d) => { router.replace(d.next); router.refresh(); });
      }}>
        <FormField id="reg-name" name="fullName" autoComplete="name" required label={t.auth.fullName} value={fullName} onChange={setFullName} error={fields.fullName} />
        <FormField id="reg-email" name="email" type="email" autoComplete="email" required label={t.auth.email} value={email} onChange={setEmail} error={fields.email} />
        <FormField id="reg-password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} label={t.auth.password} hint={t.auth.passwordHint} value={password} onChange={setPassword} error={fields.password} />
        <ErrorLine msg={error} />
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>{pending ? t.auth.working : t.auth.register}</button>
      </form>
      <p className="mt-4">{t.auth.haveAccount} <Link className="font-semibold underline underline-offset-4" href={localePath(locale, "/login")}>{t.auth.signIn}</Link></p>
    </Shell>
  );
}

export function ForgotForm() {
  const { locale, t } = useI18n();
  const { pending, error, submit } = useSubmit();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Shell title={t.auth.forgotTitle}>
      {sent ? (
        <p role="status" className="border-2 border-ink bg-mint p-4">{t.auth.resetSent}</p>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(() => requestPasswordReset(email, locale), () => setSent(true)); }}>
          <FormField id="fp-email" name="email" type="email" autoComplete="email" required label={t.auth.email} value={email} onChange={setEmail} />
          <ErrorLine msg={error} />
          <button type="submit" className="btn btn-primary w-full" disabled={pending}>{pending ? t.auth.working : t.auth.sendLink}</button>
        </form>
      )}
    </Shell>
  );
}

export function ResetForm({ token }: { token: string | undefined }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const { pending, error, fields, submit } = useSubmit();
  const [password, setPassword] = useState("");
  if (!token) {
    return (
      <Shell title={t.auth.resetTitle}>
        <p role="alert" className="err">{t.auth.missingToken}</p>
        <Link className="underline" href={localePath(locale, "/forgot-password")}>{t.auth.forgotTitle}</Link>
      </Shell>
    );
  }
  return (
    <Shell title={t.auth.resetTitle}>
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        submit(() => confirmPasswordReset(token, password), () => router.replace(`${localePath(locale, "/login")}`));
      }}>
        <FormField id="rp-password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} label={t.auth.newPassword} hint={t.auth.passwordHint} value={password} onChange={setPassword} error={fields.password} />
        <ErrorLine msg={error} />
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>{pending ? t.auth.working : t.auth.saveNewPassword}</button>
      </form>
    </Shell>
  );
}
