"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Service } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";

const serviceSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  price: z.number().min(1, "Preço deve ser maior que zero"),
  durationMinutes: z.number().min(5, "Mínimo 5 minutos").max(480, "Máximo 8 horas"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceManagementProps {
  services: Service[];
  onAdd: (service: Omit<Service, "id" | "active">) => void;
  onUpdate: (id: string, service: Partial<Service>) => void;
  onDelete: (id: string) => void;
}

export function ServiceManagement({
  services,
  onAdd,
  onUpdate,
  onDelete,
}: ServiceManagementProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const openNewForm = () => {
    reset({ name: "", description: "", price: 0, durationMinutes: 30 });
    setEditingService(null);
    setDialogOpen(true);
  };

  const openEditForm = (service: Service) => {
    reset({
      name: service.name,
      description: service.description || "",
      price: service.price,
      durationMinutes: service.durationMinutes,
    });
    setEditingService(service);
    setDialogOpen(true);
  };

  const onSubmit = (data: ServiceFormData) => {
    if (editingService) {
      onUpdate(editingService.id, data);
    } else {
      onAdd(data);
    }
    setDialogOpen(false);
    reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Serviços ({services.length})</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" onClick={openNewForm} />}>
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="svc-name">Nome</Label>
                <Input id="svc-name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-desc">Descrição</Label>
                <Input id="svc-desc" {...register("description")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="svc-price">Preço (R$)</Label>
                  <Input
                    id="svc-price"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="svc-duration">Duração (min)</Label>
                  <Input
                    id="svc-duration"
                    type="number"
                    {...register("durationMinutes", { valueAsNumber: true })}
                  />
                  {errors.durationMinutes && (
                    <p className="text-sm text-destructive">
                      {errors.durationMinutes.message}
                    </p>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingService ? "Salvar" : "Criar Serviço"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{service.name}</h4>
                    {!service.active && (
                      <Badge variant="outline" className="text-xs opacity-60">
                        Inativo
                      </Badge>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      R$ {service.price}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {service.durationMinutes}min
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={service.active}
                    onCheckedChange={(active) =>
                      onUpdate(service.id, { active })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditForm(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
