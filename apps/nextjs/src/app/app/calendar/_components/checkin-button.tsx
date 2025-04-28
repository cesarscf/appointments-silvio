import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { paymentTypeEnum } from "@acme/db/schema";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

const createCheckinSchema = z.object({
  appointmentId: z.string().uuid(),
  paymentType: z.enum(paymentTypeEnum.enumValues),
  paymentAmount: z.string().optional(),
  paymentNote: z.string().optional(),
});

interface CheckinButtonProps {
  appointmentId: string;
}

export function CheckinButton({ appointmentId }: CheckinButtonProps) {
  const [open, setOpen] = React.useState(false);
  const apiUtils = api.useUtils();

  const checkInMutation = api.appointment.checkInAppointment.useMutation({
    onSuccess: () => {
      toast.success("Checkin realizado.");
      apiUtils.appointment.listAppointments.invalidate();
      setOpen(false);
    },
  });

  const form = useForm<z.infer<typeof createCheckinSchema>>({
    resolver: zodResolver(createCheckinSchema),
    defaultValues: {
      appointmentId,
      paymentAmount: "",
      paymentNote: "",
      paymentType: "pix",
    },
  });

  async function onSubmit(inputs: z.infer<typeof createCheckinSchema>) {
    checkInMutation.mutateAsync({
      ...inputs,
    });
  }

  const paymentOptions = [
    { value: "pix", label: "PIX" },
    { value: "credit_card", label: "Cartão de Crédito" },
    { value: "debit_card", label: "Cartão de Débito" },
    { value: "cash", label: "Dinheiro" },
    { value: "package", label: "Pacote/Pacote de Serviços" },
    { value: "loyalty", label: "Programa de Fidelidade" },
    { value: "other", label: "Outro" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={"sm"}>
          Checkin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Checkin</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo do pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentOptions.map((it) => (
                        <SelectItem value={it.value}>{it.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentAmount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Valor pago</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className="-me-px rounded-e-none ps-8 shadow-none"
                        placeholder="0.00"
                        type="text"
                      />
                      <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                        R$
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentNote"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Comentários</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mais detalhes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="ml-auto w-fit"
              disabled={checkInMutation.isPending}
            >
              {checkInMutation.isPending && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Checkin
              <span className="sr-only">Checkin</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
