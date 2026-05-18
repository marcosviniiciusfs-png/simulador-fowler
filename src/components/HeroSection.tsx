import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onSimulateClick: () => void;
}

const HeroSection = ({ onSimulateClick }: HeroSectionProps) => {
  const benefits = [
    "100% Gratuito",
    "Sem consulta ao SPC",
    "Resultado no WhatsApp",
    "Lojas em parceria"
  ];

  return (
    <section id="inicio" className="pt-24 pb-16 bg-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
              Simule agora o seu crédito ideal para conquistar o seu sonho
            </h1>

            <p className="text-lg text-muted-foreground font-medium">
              + de 1000 simulações realizadas
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-scale-in flex items-center justify-center">
            <Button
              onClick={onSimulateClick}
              className="w-full max-w-md bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-2xl md:text-3xl px-10 py-12 md:py-16 rounded-2xl shadow-2xl hover:shadow-xl hover:scale-105 transition-all h-auto whitespace-normal leading-tight"
            >
              Simular crédito agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
