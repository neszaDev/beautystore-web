"use client";

import { useState } from "react";
import { adminLogin } from "./actions";
import { Field, Notice, SubmitRow, useAct } from "./ui";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { pending, error, act } = useAct();
  return (
    <form onSubmit={(e) => { e.preventDefault(); act(() => adminLogin({ email, password })); }} className="space-y-3">
      <Field label="Email" type="email" autoComplete="username" required value={email} onChange={setEmail} />
      <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={setPassword} />
      <Notice error={error} />
      <SubmitRow pending={pending} label="Sign in" />
    </form>
  );
}
