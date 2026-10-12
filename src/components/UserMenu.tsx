"use client";

import { useState, useRef, useEffect } from "react";
import { User, SavedLoc } from "@/types/user";

interface UserMenuProps {
  user: User | null;
  savedLocations: SavedLoc[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onSelectLocation: (loc: { name: string; lat: number; lon: number }) => void;
  onOpenManageLocation: (loc: SavedLoc) => void;
}

export function UserMenu({
  user,
  savedLocations,
  onOpenAuth,
  onLogout,
  onSelectLocation,
  onOpenManageLocation,
}: UserMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="glass min-h-9 md:min-h-11 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold hover:bg-white/10 shrink-0 transition-all flex items-center gap-2 border border-[var(--hair)] text-[var(--ink)] active:scale-95 shadow-sm"
        title="Masuk dengan Google untuk simpan lokasi & preferensi"
      >
        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" viewBox="0 0 24 24">
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
        <span>Masuk <span className="hidden sm:inline">Google</span></span>
      </button>
    );
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="glass min-h-9 md:min-h-11 px-2.5 md:px-3 py-1 md:py-1.5 flex items-center gap-2 hover:bg-white/10 shrink-0 transition-all border border-[var(--hair)] cursor-pointer"
        title="Menu Profil & Lokasi Tersimpan"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover border border-white/20"
          />
        ) : (
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[var(--glow)] text-[var(--bg)] font-bold text-xs flex items-center justify-center">
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
        )}
        <span className="text-xs md:text-sm font-medium max-w-[90px] md:max-w-[120px] truncate text-[var(--ink)]">
          {user.name.split(" ")[0]}
        </span>
        <span className="text-[10px] text-[var(--glow)] hidden sm:inline-block">▼</span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 glass glow p-3 shadow-2xl z-50 border border-[var(--hair)] rounded-2xl bg-[var(--panel)] backdrop-blur-xl animate-fade-in text-[var(--ink)]">
          {/* User Profile Header */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[var(--hair)]">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[var(--glow)] text-[var(--bg)] font-bold text-sm flex items-center justify-center">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate">{user.name}</div>
              <div className="text-[11px] text-[var(--dim)] truncate">{user.email}</div>
            </div>
          </div>

          {/* Cloud Sync Status */}
          <div className="py-2 px-1 flex items-center justify-between text-[11px] text-[var(--dim)] border-b border-[var(--hair)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Turso Cloud Sync
            </span>
            <span className="font-mono text-[10px] text-[var(--glow)]">
              {savedLocations.length} Lokasi
            </span>
          </div>

          {/* Saved Locations List */}
          <div className="py-2 max-h-48 overflow-y-auto space-y-1">
            <div className="label px-1 py-0.5">Lokasi Personal Anda</div>
            {savedLocations.length === 0 ? (
              <div className="text-xs text-[var(--dim)] px-2 py-3 text-center">
                Belum ada lokasi tersimpan.<br />
                <span className="text-[10px] opacity-75">Klik bintang ⭐ pada kota untuk menyimpan.</span>
              </div>
            ) : (
              savedLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/5 transition-colors group text-xs"
                >
                  <button
                    onClick={() => {
                      onSelectLocation({ name: loc.name, lat: loc.lat, lon: loc.lon });
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
                  >
                    <span className="font-medium text-[var(--ink)] truncate">
                      {loc.custom_label}
                    </span>
                    <span className="text-[10px] text-[var(--dim)] truncate">
                      ({loc.name})
                    </span>
                    {loc.is_primary === 1 && (
                      <span className="text-[10px] text-amber-300" title="Lokasi Utama">⭐</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onOpenManageLocation(loc);
                      setDropdownOpen(false);
                    }}
                    className="p-1 text-[var(--dim)] hover:text-[var(--glow)] transition-colors opacity-70 group-hover:opacity-100"
                    title="Ubah label / hapus"
                  >
                    ✏️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-[var(--hair)]">
            <button
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
              className="w-full py-1.5 px-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center gap-1.5 font-medium"
            >
              🚪 Keluar dari Akun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
