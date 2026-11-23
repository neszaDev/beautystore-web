"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormField } from "@/components/form-field";
import { useI18n } from "@/components/i18n-provider";
import type { UserView } from "@/lib/types";
import { logout } from "@/features/auth/actions";
import { changePassword, updateProfile } from "./actions";

const Msg = ({ m }: { m: { ok: boolean; text: string } | null }) =>
  m ? <p role={m.ok ? "status" : "alert"} className={m.ok ? "font-semibold" : "err font-semibold"}>{m.text}</p> : null;

export function ProfileForms({ user }: { user: UserView }) {
  const { locale, t, err } = useI18n();
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [pMsg, setPMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [wMsg, setWMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await updateProfile(fullName, phone);
          setPMsg(r.ok ? { ok: true, text: t.account.saved } : { ok: false, text: err(r.code) });
          if (r.ok) router.refresh();
        });
      }}>
        <h2 className="text-2xl">{t.account.profile}</h2>
        <p className="text-ink-soft">{user.email}</p>
        <FormField id="pf-name" name="fullName" autoComplete="name" label={t.auth.fullName} value={fullName} onChange={setFullName} />
        <FormField id="pf-phone" name="phone" type="tel" autoComplete="tel" label={t.account.phone} value={phone} onChange={setPhone} />
        <Msg m={pMsg} />
        <button type="submit" className="btn btn-ink" disabled={pending}>{t.common.save}</button>
      </form>
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await changePassword(cur, next);
          setWMsg(r.ok ? { ok: true, text: t.account.passwordChanged } : { ok: false, text: err(r.code) });
          if (r.ok) { setCur(""); setNext(""); }
        });
      }}>
        <h2 className="text-2xl">{t.account.changePassword}</h2>
        <FormField id="pw-cur" name="currentPassword" type="password" autoComplete="current-password" required label={t.account.currentPassword} value={cur} onChange={setCur} />
        <FormField id="pw-new" name="newPassword" type="password" autoComplete="new-password" required minLength={10} maxLength={128} label={t.auth.newPassword} hint={t.auth.passwordHint} value={next} onChange={setNext} />
        <Msg m={wMsg} />
        <button type="submit" className="btn btn-ink" disabled={pending}>{t.account.changePassword}</button>
      </form>
      <div className="md:col-span-2">
        <button type="button" className="btn btn-ghost" data-testid="logout" onClick={() => start(async () => {
          const r = await logout(locale);
          if (r.ok) { router.replace(r.data.next); router.refresh(); }
        })}>
          {t.auth.signOut}
        </button>
      </div>
    </div>
  );
}
