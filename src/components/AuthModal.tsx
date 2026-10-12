"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const DEFAULT_CLIENT_ID = "421276748294-n9f680ie9a9hcqnvuu42nsq0hf5fhr22.apps.googleusercontent.com";

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;

  useEffect(() => {
    if (!isOpen) return;

    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              await handleVerifyToken(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnContainer = document.getElementById("google-signin-btn-container");
        if (btnContainer) {
          btnContainer.innerHTML = "";
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "filled_blue",
            size: "large",
            shape: "pill",
            text: "signin_with",
            width: 280,
          });
        }
      } catch (e) {
        console.warn("GSI init warning:", e);
      }
    }
  }, [isOpen, googleClientId]);

  async function handleVerifyToken(idToken: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || "Gagal verifikasi Google token");
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat verifikasi login");
    } finally {
      setLoading(false);
    }
  }

  async function handleInstantLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_demo: true,
          demoUser: {
            id: "google_user_naufal",
            email: "naufalfaster@gmail.com",
            name: "Naufal Irfansyah",
            picture: "https://lh3.googleusercontent.com/a/ACg8ocIS0GZ4y-H9m7Nl4",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || "Gagal masuk");
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan login");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="glass glow w-full max-w-md p-6 relative border border-[var(--hair)] rounded-2xl bg-[var(--panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--dim)] hover:text-[var(--ink)] text-lg p-1 transition-colors"
          aria-label="Tutup"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl mb-3 shadow-inner">
            🌤️
          </div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--ink)]">
            Masuk dengan Google
          </h2>
          <p className="text-xs md:text-sm text-[var(--dim)] mt-1 max-w-xs mx-auto">
            Simpan lokasi favorit (Rumah, Kantor) dan tetapkan lokasi utama otomatis di cloud.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3 w-full">
          {/* Official Google Sign-In Button Container */}
          <div id="google-signin-btn-container" className="flex justify-center min-h-[44px] my-1"></div>

          {/* Quick Instant Option */}
          <div className="w-full flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-[var(--hair)]"></div>
            <span className="text-[10px] uppercase font-mono text-[var(--dim)] tracking-wider">
              atau masuk instan
            </span>
            <div className="flex-1 h-px bg-[var(--hair)]"></div>
          </div>

          <button
            onClick={handleInstantLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full bg-white/5 hover:bg-white/10 border border-[var(--hair)] text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-[var(--dim)] hover:text-[var(--ink)]"
          >
            <span>⚡ Masuk Cepat (Akun Naufal · Turso Cloud)</span>
          </button>
        </div>

        <div className="mt-5 text-[11px] text-center text-[var(--dim)] space-y-1">
          <div>🔒 Dilindungi Google OAuth 2.0 & Turso Database Cloud</div>
          <div>Bebas iklan & privasi lokasi Anda terlindungi</div>
        </div>
      </div>
    </div>
  );
}
