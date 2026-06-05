import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import InputMask from "react-input-mask";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSimulatorModal } from "@/contexts/SimulatorModalContext";

const WORKER_URL = "https://grupo-efata-lead.marcosviniicius-fs.workers.dev/";

type FormData = {
  fullName: string;
  whatsapp: string;
  propertyType: string;
  creditAmount: string;
  downPaymentAmount: string;
};

const emptyForm: FormData = {
  fullName: "",
  whatsapp: "",
  propertyType: "",
  creditAmount: "",
  downPaymentAmount: "",
};

const formatCurrency = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  const amount = Number(digits) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

const RequiredMark = () => <span className="text-destructive ml-1">*</span>;

const Simulator = () => {
  const { isOpen, close } = useSimulatorModal();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleCurrencyChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) =>
    setField(field, formatCurrency(e.target.value));

  const validate = (): string | null => {
    if (!formData.fullName.trim()) return "Informe o nome completo.";
    if (formData.whatsapp.replace(/\D/g, "").length !== 11) return "WhatsApp inválido. Use (DDD) 9XXXX-XXXX.";
    if (!formData.propertyType) return "Selecione o tipo de bem.";
    if (!formData.creditAmount) return "Informe o valor do crédito.";
    if (!formData.downPaymentAmount) return "Informe o valor de entrada ideal.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const error = validate();
    if (error) {
      toast({
        title: "Verifique os dados",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const eventId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const today = new Date().toISOString().split("T")[0];

    const getCookie = (name: string): string | undefined => {
      const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return m ? decodeURIComponent(m[1]) : undefined;
    };

    const payload = {
      ...formData,
      data_entrada: today,
      event_id: eventId,
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
      source_url: window.location.href,
    };

    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") {
      fbq("track", "Lead", {}, { eventID: eventId });
    }

    try {
      fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => console.error("Worker dispatch failed:", err));
    } catch (err) {
      console.error("Worker dispatch threw:", err);
    }

    setFormData(emptyForm);
    setIsSubmitting(false);
    close();
    navigate("/obrigado");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : close())}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Simulador de Crédito</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para receber sua simulação no WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Nome completo
              <RequiredMark />
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="Digite seu nome completo"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">
              WhatsApp
              <RequiredMark />
            </Label>
            <InputMask
              mask="(99) 99999-9999"
              value={formData.whatsapp}
              onChange={(e) => setField("whatsapp", e.target.value)}
            >
              {/* @ts-ignore */}
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  id="whatsapp"
                  type="tel"
                  inputMode="numeric"
                  placeholder="(DDD) 9XXXX-XXXX"
                  autoComplete="tel"
                />
              )}
            </InputMask>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyType">
              Tipo de bem
              <RequiredMark />
            </Label>
            <Select
              value={formData.propertyType}
              onValueChange={(value) => setField("propertyType", value)}
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Selecione o tipo de bem" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="Imóvel">Imóvel</SelectItem>
                <SelectItem value="Veículo">Veículo</SelectItem>
                <SelectItem value="Moto">Moto</SelectItem>
                <SelectItem value="Caminhão">Caminhão</SelectItem>
                <SelectItem value="Maquinário">Maquinário</SelectItem>
                <SelectItem value="Serviços">Serviços</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditAmount">
              Valor do crédito
              <RequiredMark />
            </Label>
            <Input
              id="creditAmount"
              value={formData.creditAmount}
              onChange={handleCurrencyChange("creditAmount")}
              placeholder="R$ 0,00"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downPaymentAmount">
              Valor de entrada ideal
              <RequiredMark />
            </Label>
            <Input
              id="downPaymentAmount"
              value={formData.downPaymentAmount}
              onChange={handleCurrencyChange("downPaymentAmount")}
              placeholder="R$ 0,00"
              inputMode="numeric"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-6 text-base"
          >
            {isSubmitting ? "Enviando..." : "Finalizar Simulação"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Simulator;
