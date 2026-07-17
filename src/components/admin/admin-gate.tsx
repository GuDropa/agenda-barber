"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Lock, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminGateStatus, verifyAdminPassword } from "@/app/actions/auth";
import type { AdminGateState } from "@/lib/tenant";
import type { Brand } from "@/config/brand";

/**
 * Chave do flag de desbloqueio no localStorage (V14). Escopo por origem
 * ∴ isolamento por tenant automático (cada barbeiro = seu domínio, V15).
 */
export const ADMIN_UNLOCK_KEY = "agenda-barber:admin-unlocked";

/** Marca o admin como desbloqueado neste navegador. */
export function setAdminUnlocked() {
  try {
    localStorage.setItem(ADMIN_UNLOCK_KEY, "1");
  } catch {
    /* localStorage indisponível — ignora */
  }
}

/** Limpa o desbloqueio → re-bloqueia o admin (usado pelo botão "Sair"). */
export function clearAdminUnlocked() {
  try {
    localStorage.removeItem(ADMIN_UNLOCK_KEY);
  } catch {
    /* localStorage indisponível — ignora */
  }
}

function isUnlockedInStorage() {
  try {
    return localStorage.getItem(ADMIN_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Portão de acesso ao painel admin (V12). Só renderiza `children` quando
 * desbloqueado — via flag no localStorage (V14) ou senha correta do tenant.
 * A leitura do localStorage acontece só após montar, para não quebrar a
 * hidratação (V18).
 */
export function AdminGate({
  brand,
  children,
}: {
  brand: Brand;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [state, setState] = useState<AdminGateState | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (isUnlockedInStorage()) {
      setUnlocked(true);
      return;
    }

    let active = true;
    getAdminGateStatus()
      .then((s) => {
        if (!active) return;
        setState(s);
        // Portão aberto (dev/marca padrão): libera sem pedir senha (V17).
        if (s === "open") {
          setAdminUnlocked();
          setUnlocked(true);
        }
      })
      .catch(() => {
        if (active) setState("required");
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const ok = await verifyAdminPassword(password);
      if (ok) {
        setAdminUnlocked();
        setUnlocked(true);
      } else {
        setError(true);
        setPassword("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // V18 — nada é renderizado antes de montar no cliente (evita mismatch).
  if (!mounted || (!unlocked && state === null)) {
    return (
      <div className="min-h-dvh max-w-lg mx-auto flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <main className="min-h-dvh max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
        {state === "unconfigured" ? (
          <ShieldAlert className="h-7 w-7 text-primary" />
        ) : (
          <Lock className="h-7 w-7 text-primary" />
        )}
      </div>

      <h1 className="text-xl font-bold tracking-tight">{brand.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Área do barbeiro</p>

      {state === "unconfigured" ? (
        <p className="mt-6 max-w-xs text-sm text-muted-foreground">
          Acesso não configurado. Defina uma senha no campo{" "}
          <span className="font-medium text-foreground">AdminPassword</span> do
          seu cadastro para liberar o painel.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xs space-y-3">
          <div className="space-y-1.5 text-left">
            <Label htmlFor="admin-password">Senha de acesso</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              aria-invalid={error}
              placeholder="••••••••"
            />
            {error && (
              <p className="text-xs text-destructive">Senha incorreta.</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || password.length === 0}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      )}

      <Button variant="link" size="sm" className="mt-6" render={<Link href="/" />}>
        Voltar ao início
      </Button>
    </main>
  );
}
