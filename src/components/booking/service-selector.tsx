"use client";

import { Service } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
}

export function ServiceSelector({
  services,
  selectedService,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <section className="px-4 pb-6">
      <h2 className="text-lg font-semibold mb-4 px-2">Escolha o serviço</h2>
      <div className="space-y-3">
        {services
          .filter((s) => s.active)
          .map((service) => {
            const isSelected = selectedService?.id === service.id;
            return (
              <Card
                key={service.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 active:scale-[0.98]",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => onSelect(service)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{service.name}</h3>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {service.durationMinutes}min
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-base font-semibold shrink-0 ml-4"
                  >
                    R$ {service.price}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </section>
  );
}
