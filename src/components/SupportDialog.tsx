import { useState } from "react";
import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const SUPPORT_EMAIL = "contatonorthnote@gmail.com";

export function SupportDialog({
  triggerLabel = "Suporte",
  variant = "ghost",
  size = "sm",
  className = "",
}: {
  triggerLabel?: string;
  variant?: "ghost" | "outline" | "link";
  size?: "sm" | "default" | "icon";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
    } catch {
      /* clipboard may be blocked; the mailto link still works */
    }
    setCopied(true);
    toast.success("E-mail copiado.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Mail className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Fale com a gente</DialogTitle>
          <DialogDescription className="text-base">
            Precisa de ajuda ou tem uma sugestão de melhoria? Escreva para a gente — respondemos
            por e-mail.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 font-display text-lg break-all">
          {SUPPORT_EMAIL}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("North Note — ajuda ou sugestão")}`}
            >
              <Mail className="h-4 w-4" /> Enviar e-mail
            </a>
          </Button>
          <Button variant="outline" onClick={copyEmail}>
            <Copy className="h-4 w-4" /> {copied ? "Copiado!" : "Copiar e-mail"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Se o seu app de e-mail não abrir, copie o endereço e envie de onde preferir.
        </p>
      </DialogContent>
    </Dialog>
  );
}
