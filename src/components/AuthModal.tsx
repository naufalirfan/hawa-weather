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

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "813959882200-c0813v99mshiq4h20623u1g9g3i8cskp.apps.googleusercontent.com"; // Placeholder or fallback

  useEffect(() => {
    if (!isOpen) return;

    // Initialize Google Identity Services if loaded and client ID provided
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              await handleVerifyToken(response.credential);
            }
          },
        });

        // Render official button into target div if present
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
      setError(err?.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_demo: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || "Gagal masuk demo");
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan demo login");
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
            Simpan lokasi favorit (Rumah, Kantor), atur lokasi pembuka otomatis, dan sinkronkan ke semua perangkat Anda.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          {/* Official Google Button Container */}
          <div id="google-signin-btn-container" className="flex justify-center min-h-[44px]"></div>

          {/* Fallback / Instant Demo Login */}
          <div className="w-full flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-[var(--hair)]"></div>
            <span className="text-[10px] uppercase font-mono text-[var(--dim)] tracking-wider">
              atau akses cepat
            </span>
            <div className="flex-1 h-px bg-[var(--hair)]"></div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-[var(--hair)] text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-[var(--ink)]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {loading ? "Memproses..." : "Masuk Akun Google (Instan Sync)"}
          </button>
        </div>

        <div className="mt-5 text-[11px] text-center text-[var(--dim)] space-y-1">
          <div>🔒 Dilindungi enkripsi Web-Crypto & Turso Cloud DB</div>
          <div>Bebas iklan & privasi lokasi Anda terlindungi</div>
        </div>
      </div>
    </div>
  );
}
