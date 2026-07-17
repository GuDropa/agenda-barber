"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CalendarCheck, CheckCircle2, Link2Off, Loader2 } from "lucide-react";
import {
  getGoogleCalendarStatus,
  disconnectGoogleCalendar,
  setGoogleReminderMinutes,
} from "@/app/actions/google";

/** Logo "G" oficial do Google (4 cores). Ver diretrizes de marca. */
function GoogleGLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * Botão "Fazer login com o Google" seguindo as diretrizes de marca do Google
 * Identity (logo G oficial, fundo branco, borda neutra) — §V11.
 */
function GoogleSignInButton({ disabled }: { disabled?: boolean }) {
  const base =
    "inline-flex items-center justify-center gap-3 h-10 rounded-md border border-[#747775] bg-white px-3 text-sm font-medium text-[#1f1f1f] shadow-sm transition-colors hover:bg-[#f8f9fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4]/50";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${base} pointer-events-none opacity-50`}
      >
        <GoogleGLogo />
        Fazer login com o Google
      </span>
    );
  }

  return (
    <a href="/api/google/connect" className={base}>
      <GoogleGLogo />
      Fazer login com o Google
    </a>
  );
}

export function GoogleCalendarConnect() {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    getGoogleCalendarStatus()
      .then((s) => {
        setConfigured(s.configured);
        setConnected(s.connected);
        setAccountEmail(s.accountEmail);
        setMinutes(s.reminderMinutes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Feedback do retorno do OAuth (?google=connected|error|unconfigured).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("google");
    if (!g) return;

    if (g === "connected") toast.success("Google Agenda conectada!");
    else if (g === "error") toast.error("Falha ao conectar a Google Agenda.");
    else if (g === "unconfigured")
      toast.error("Integração Google não configurada no servidor.");

    params.delete("google");
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (qs ? `?${qs}` : "")
    );
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    const ok = await disconnectGoogleCalendar();
    setDisconnecting(false);
    if (ok) {
      setConnected(false);
      setAccountEmail(null);
      setConfirmOpen(false);
      toast.success("Google Agenda desconectada.");
    } else {
      toast.error("Não foi possível desconectar.");
    }
  };

  const handleSaveMinutes = async () => {
    setSaving(true);
    const ok = await setGoogleReminderMinutes(minutes);
    setSaving(false);
    if (ok) toast.success("Lembrete atualizado.");
    else toast.error("Falha ao salvar o lembrete.");
  };

  if (loading) return null;

  return (
    <Card className="mb-4">
      <CardContent className="p-y-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarCheck className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">Google Agenda</p>
                {connected && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Conectada
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {connected
                  ? accountEmail
                    ? `Conta: ${accountEmail}`
                    : "Novos agendamentos vão para sua agenda"
                  : "Conecte para receber os agendamentos na sua agenda"}
              </p>
            </div>
          </div>

          {connected && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setConfirmOpen(true)}
            >
              <Link2Off className="h-4 w-4 mr-1" />
              Desconectar
            </Button>
          )}
        </div>

        {!connected && (
          <div>
            <GoogleSignInButton disabled={!configured} />
            {!configured && (
              <p className="mt-2 text-xs text-muted-foreground">
                Integração ainda não configurada pelo administrador do sistema.
              </p>
            )}
          </div>
        )}

        {connected && (
          <div className="flex items-end gap-2 pt-1">
            <div className="flex-1">
              <Label htmlFor="reminder-min" className="text-xs">
                Lembrete (minutos antes)
              </Label>
              <Input
                id="reminder-min"
                type="number"
                min={0}
                max={1440}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveMinutes}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Confirmação de desconexão */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => !open && setConfirmOpen(false)}
      >
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <Link2Off className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">
              Desconectar Google Agenda?
            </DialogTitle>
            <DialogDescription className="text-center">
              Novos agendamentos deixarão de ser adicionados à sua agenda Google.
              {accountEmail ? ` Conta: ${accountEmail}.` : ""} Você pode
              reconectar a qualquer momento.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmOpen(false)}
              disabled={disconnecting}
            >
              Manter
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Desconectar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
