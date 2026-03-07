"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Save } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  worker_note?: string | null;
  custom_price?: number | null;
  price: string | number;
}

interface Props {
  booking: Booking;
  accessToken: string;
  onSaved: (data: Record<string, unknown>) => void;
}

export default function WorkerCustomizeSection({ booking, accessToken, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState(booking.worker_note ?? "");
  const [editPrice, setEditPrice] = useState(String(booking.custom_price ?? booking.price ?? ""));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${booking.id}/customize`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ worker_note: editNote, custom_price: Number(editPrice) }),
      });
      if (!res.ok) return;
      const data = await res.json();
      onSaved(data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Customize this request</p>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-green-700 hover:underline flex items-center gap-1">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
      </div>
      {editing ? (
        <>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Custom price ($)</label>
            <input
              type="number" min="0" step="0.01" value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Note for client</label>
            <textarea
              value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={3}
              placeholder="Add details, conditions, or a personalised message…"
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white gap-1" onClick={save} disabled={saving}>
              <Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
          </div>
        </>
      ) : (
        <>
          {booking.custom_price && <p className="text-sm text-gray-700">Custom price: <span className="font-semibold text-green-700">${Number(booking.custom_price)}</span></p>}
          {booking.worker_note && <p className="text-sm text-gray-600 whitespace-pre-line">{booking.worker_note}</p>}
          {!booking.custom_price && !booking.worker_note && (
            <p className="text-xs text-gray-400 italic">No customization yet — click Edit to add a note or adjust the price.</p>
          )}
        </>
      )}
    </div>
  );
}
