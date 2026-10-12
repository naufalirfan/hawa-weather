"use client";

import { useState } from "react";
import { SavedLoc } from "@/types/user";

interface SavedLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlace: { name: string; lat: number; lon: number };
  existingLoc?: SavedLoc | null;
  onSave: (loc: { name: string; custom_label: string; lat: number; lon: number; is_primary: boolean }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const PRESET_LABELS = [
  { icon: "🏠", label: "Rumah" },
  { icon: "🏢", label: "Kantor" },
  { icon: "🏫", label: "Kampus" },
  { icon: "🏖️", label: "Liburan" },
  { icon: "⭐", label: "Favorit" },
];

export function SavedLocationModal({
  isOpen,
  onClose,
  currentPlace,
  existingLoc,
  onSave,
  onDelete,
}: SavedLocationModalProps) {
  const [label, setLabel] = useState(existingLoc?.custom_label || "Favorit");
  const [isPrimary, setIsPrimary] = useState(Boolean(existingLoc?.is_primary));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave({
        name: currentPlace.name,
        custom_label: label.trim() || "Favorit",
        lat: currentPlace.lat,
        lon: currentPlace.lon,
        is_primary: isPrimary,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan lokasi");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!existingLoc || !onDelete) return;
    setLoading(true);
    try {
      await onDelete(existingLoc.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Gagal menghapus lokasi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="glass glow w-full max-w-sm p-5 relative border border-[var(--hair)] rounded-2xl bg-[var(--panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--dim)] hover:text-[var(--ink)] text-lg p-1 transition-colors"
          aria-label="Tutup"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📍</span>
          <div>
            <h3 className="font-bold text-base text-[var(--ink)] leading-none">
              {existingLoc ? "Kelola Lokasi Tersimpan" : "Simpan Lokasi Personal"}
            </h3>
            <p className="text-xs text-[var(--dim)] mt-0.5 truncate max-w-[200px]">
              {currentPlace.name}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          <div>
            <label className="label block mb-1.5">Pilih / Ketik Label Lokasi</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_LABELS.map((p) => {
                const isSelected = label.toLowerCase().includes(p.label.toLowerCase());
                return (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => setLabel(`${p.icon} ${p.label}`)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                      isSelected
                        ? "bg-[var(--glow)] text-[var(--bg)] font-semibold border-transparent"
                        : "border-[var(--hair)] text-[var(--dim)] hover:text-[var(--ink)] bg-white/5"
                    }`}
                  >
                    {p.icon} {p.label}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: 🏠 Rumah, 🏢 Kantor..."
              className="w-full rounded-xl bg-white/5 border border-[var(--hair)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--glow)] transition-colors"
              required
            />
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-[var(--hair)]">
            <input
              type="checkbox"
              id="is_primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--glow)] accent-[var(--glow)] cursor-pointer"
            />
            <label htmlFor="is_primary" className="text-xs text-[var(--ink)] cursor-pointer leading-tight">
              <span className="font-semibold block">Jadikan Lokasi Utama</span>
              <span className="text-[10px] text-[var(--dim)]">
                Buka cuaca kota ini secara otomatis tiap kali Anda mengakses Hawa
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-full bg-[var(--glow)] hover:opacity-90 text-[var(--bg)] font-bold text-xs md:text-sm transition-all shadow-md active:scale-95"
            >
              {loading ? "Menyimpan..." : existingLoc ? "Perbarui Lokasi" : "Simpan ke Akun"}
            </button>

            {existingLoc && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-3 py-2 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all"
                title="Hapus lokasi ini"
              >
                Hapus
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
