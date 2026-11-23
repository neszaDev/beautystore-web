"use client";

import { useState } from "react";
import type { OrderStatus } from "@/lib/types";
import { resolveAttention, saveTracking, transitionOrder } from "./actions";
import { allowedNextStatuses, cancelReturnsStock, orNull } from "./lib";
import { BTN_GHOST, BTN_PRIMARY, CARD } from "./styles";
import { Field, Modal, Notice, SubmitRow, TextArea, useAct } from "./ui";

type O = { number: string; status: OrderStatus; needsAttention: boolean; carrier: string | null; trackingNumber: string | null; trackingUrl: string | null };

export function OrderActions({ order }: { order: O }) {
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const next = allowedNextStatuses(order.status);
  return (
    <div className="space-y-4">
      {order.needsAttention && <ResolveForm number={order.number} />}
      <section className={CARD} aria-labelledby="act-h">
        <h2 id="act-h" className="mb-2 text-lg">Change status</h2>
        {next.length === 0 ? <p className="text-sm text-ink-soft">This order is {order.status}; no further status changes are possible.</p> : (
          <div className="flex flex-wrap gap-2">
            {next.map((s) => <button key={s} className={s === "CANCELLED" ? BTN_GHOST : BTN_PRIMARY} onClick={() => setTarget(s)}>{s === "CANCELLED" ? "Cancel order" : `Mark ${s}`}</button>)}
          </div>
        )}
        <Modal open={target !== null} onClose={() => setTarget(null)} title={target === "CANCELLED" ? "Cancel this order?" : `Mark ${order.number} as ${target}`}>
          {target && <TransitionForm order={order} to={target} onDone={() => setTarget(null)} onCancel={() => setTarget(null)} />}
        </Modal>
        {(order.status === "SHIPPED" || order.status === "DELIVERED") && <TrackingForm order={order} />}
      </section>
    </div>
  );
}

function TransitionForm({ order, to, onDone, onCancel }: { order: O; to: OrderStatus; onDone: () => void; onCancel: () => void }) {
  const [note, setNote] = useState("");
  const [carrier, setCarrier] = useState(order.carrier ?? "");
  const [tn, setTn] = useState(order.trackingNumber ?? "");
  const [url, setUrl] = useState(order.trackingUrl ?? "");
  const { pending, error, act, fail } = useAct();
  return (
    <form className="space-y-3" onSubmit={(e) => {
      e.preventDefault();
      if (to === "SHIPPED") {
        if (!tn.trim()) return fail("A tracking number is required to mark an order as shipped.");
        if (url.trim() && !/^https:\/\/\S+$/.test(url.trim())) return fail("Tracking URL must start with https://");
      }
      act(() => transitionOrder(order.number, { to, note: orNull(note) ?? undefined,
        ...(to === "SHIPPED" ? { carrier: orNull(carrier) ?? undefined, trackingNumber: tn.trim(), trackingUrl: orNull(url) ?? undefined } : {}) }), { onOk: onDone });
    }}>
      {to === "CANCELLED" && cancelReturnsStock(order.status) && (
        <p role="note" className="rounded-md border border-line bg-butter/40 p-3 text-sm">
          This order is paid. Cancelling returns its stock to inventory, but <strong>the refund is not automatic</strong>: issue it in the payment provider dashboard.
        </p>
      )}
      {to === "SHIPPED" && (<>
        <Field label="Carrier (optional)" value={carrier} onChange={setCarrier} />
        <Field label="Tracking number" required value={tn} onChange={setTn} />
        <Field label="Tracking URL (https, optional)" type="url" value={url} onChange={setUrl} />
      </>)}
      <TextArea label="Note (optional)" value={note} onChange={setNote} rows={2} />
      <Notice error={error} />
      <div className="flex justify-end gap-2">
        <button type="button" className={BTN_GHOST} onClick={onCancel}>{to === "CANCELLED" ? "Keep order" : "Close"}</button>
        <SubmitRow pending={pending} label={to === "CANCELLED" ? "Cancel order" : "Confirm"} />
      </div>
    </form>
  );
}

function TrackingForm({ order }: { order: O }) {
  const [carrier, setCarrier] = useState(order.carrier ?? "");
  const [tn, setTn] = useState(order.trackingNumber ?? "");
  const [url, setUrl] = useState(order.trackingUrl ?? "");
  const { pending, error, done, act, fail } = useAct();
  return (
    <form className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3" onSubmit={(e) => {
      e.preventDefault();
      if (!tn.trim()) return fail("Tracking number is required.");
      if (url.trim() && !/^https:\/\/\S+$/.test(url.trim())) return fail("Tracking URL must start with https://");
      act(() => saveTracking(order.number, { carrier: orNull(carrier) ?? undefined, trackingNumber: tn.trim(), trackingUrl: orNull(url) ?? undefined }), { success: "Tracking updated." });
    }}>
      <Field label="Carrier" value={carrier} onChange={setCarrier} />
      <Field label="Tracking number" required value={tn} onChange={setTn} />
      <Field label="Tracking URL" type="url" value={url} onChange={setUrl} />
      <div className="space-y-2 sm:col-span-3"><Notice error={error} done={done} /><SubmitRow pending={pending} label="Update tracking" /></div>
    </form>
  );
}

function ResolveForm({ number }: { number: string }) {
  const [note, setNote] = useState("");
  const { pending, error, act, fail } = useAct();
  return (
    <section role="region" aria-labelledby="att-h" className="rounded-lg border-2 border-ink bg-butter/50 p-4">
      <h2 id="att-h" className="text-lg">Needs attention</h2>
      <p className="mb-2 text-sm">A payment mismatch, late payment or double payment was flagged on this order. Check the payment provider, then record what you did.</p>
      <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return fail("A note is required."); act(() => resolveAttention(number, note.trim())); }}>
        <TextArea label="Resolution note (required)" value={note} onChange={setNote} rows={2} />
        <Notice error={error} /><SubmitRow pending={pending} label="Mark resolved" />
      </form>
    </section>
  );
}
