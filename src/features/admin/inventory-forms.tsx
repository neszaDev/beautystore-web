"use client";

import { useState } from "react";
import { adjustStock, setThreshold } from "./actions";
import { CARD } from "./styles";
import { Field, Notice, Select, SubmitRow, useAct } from "./ui";

export function InventoryForms({ variantId, threshold }: { variantId: number; threshold: number | null }) {
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("RESTOCK");
  const [note, setNote] = useState("");
  const [th, setTh] = useState(threshold?.toString() ?? "");
  const a = useAct();
  const t = useAct();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form className={`${CARD} space-y-3`} aria-label="Adjust stock" onSubmit={(e) => {
        e.preventDefault();
        if (!/^-?[1-9]\d*$/.test(delta.trim())) return a.fail("Change must be a non-zero whole number, e.g. 24 or -3.");
        if (!note.trim()) return a.fail("A note is required so the history explains the change.");
        a.act(() => adjustStock(variantId, { delta: Number(delta), reason, note: note.trim() }), { success: "Stock adjusted.", onOk: () => { setDelta(""); setNote(""); } });
      }}>
        <h2 className="text-lg">Adjust stock</h2>
        <Field label="Change (+ adds, − removes)" inputMode="numeric" required value={delta} onChange={setDelta} />
        <Select label="Reason" value={reason} onChange={setReason}>{["RESTOCK", "ADJUSTMENT", "DAMAGE", "RETURN"].map((r) => <option key={r}>{r}</option>)}</Select>
        <Field label="Note" required value={note} onChange={setNote} />
        <Notice error={a.error} done={a.done} /><SubmitRow pending={a.pending} label="Apply adjustment" />
      </form>
      <form className={`${CARD} space-y-3`} aria-label="Low-stock threshold" onSubmit={(e) => {
        e.preventDefault();
        if (!/^\d+$/.test(th.trim())) return t.fail("Threshold must be a whole number, 0 or more.");
        t.act(() => setThreshold(variantId, Number(th)), { success: "Threshold saved." });
      }}>
        <h2 className="text-lg">Low-stock threshold</h2>
        <Field label="Alert when available is at or below" inputMode="numeric" required value={th} onChange={setTh} />
        <Notice error={t.error} done={t.done} /><SubmitRow pending={t.pending} />
      </form>
    </div>
  );
}
