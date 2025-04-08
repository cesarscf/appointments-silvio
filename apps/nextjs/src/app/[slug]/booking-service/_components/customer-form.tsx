"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { applyPhoneMask, cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  birthDate: z.coerce.date({
    required_error: "Data de nascimento é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  phoneNumber: z.string().min(11, "Telefone deve ter 11 dígitos"),
  cpf: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

interface CustomerFormProps {
  onNextStep: () => void;
  onBackStep: () => void;
  setClient: React.Dispatch<React.SetStateAction<Inputs | null>>;
  client: Inputs | null;
}

export function CustomerForm({
  setClient,
  onBackStep,
  onNextStep,
  client,
}: CustomerFormProps) {
  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: client?.name ?? "",
      address: client?.address ?? "",
      birthDate: client?.birthDate ?? new Date(),
      cpf: client?.cpf ?? "",
      email: client?.email ?? "",
      phoneNumber: client?.phoneNumber ?? "",
    },
  });

  const [phoneQuery, setPhoneQuery] = React.useState("");
  const { data: clientData, isLoading: isSearchingClient } =
    api.customer.getCustomerByPhone.useQuery(
      { phone: phoneQuery },
      { enabled: phoneQuery.length > 10, retry: false },
    );

  React.useEffect(() => {
    if (clientData) {
      form.reset({
        name: clientData.name || "",
        address: clientData.address || "",
        birthDate: clientData.birthDate || new Date(),
        cpf: clientData.cpf || "",
        email: clientData.email || "",
        phoneNumber: clientData.phoneNumber || "",
      });
    }
  }, [clientData, form]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, "");
    const formattedPhone = applyPhoneMask(phone);
    form.setValue("phoneNumber", formattedPhone);
    setPhoneQuery(phone.length === 11 ? phone : "");
  };

  function onSubmit(inputs: Inputs) {
    setClient(inputs);
    onNextStep();
  }

  const isSubmitting = form.formState.isSubmitting;
  const isValid = form.formState.isValid;

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-row items-center gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Telefone *</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="(00) 00000-0000"
                      {...field}
                      onChange={handlePhoneChange}
                    />
                  </FormControl>
                  {isSearchingClient && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Digite o nome completo"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => {
            const [displayValue, setDisplayValue] = React.useState(
              field.value ? format(field.value, "dd/MM/yyyy") : "",
            );

            React.useEffect(() => {
              setDisplayValue(
                field.value ? format(field.value, "dd/MM/yyyy") : "",
              );
            }, [field.value]);

            return (
              <FormItem className="flex flex-col">
                <FormLabel>Data de nascimento *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="DD/MM/AAAA"
                    value={displayValue}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      let formattedValue = "";

                      if (rawValue.length > 0) {
                        formattedValue = rawValue
                          .slice(0, 8)
                          .replace(/^(\d{2})/, "$1/")
                          .replace(/^(\d{2}\/\d{2})/, "$1/")
                          .slice(0, 10);
                      }

                      setDisplayValue(formattedValue);

                      if (formattedValue.length === 10) {
                        try {
                          const date = parse(
                            formattedValue,
                            "dd/MM/yyyy",
                            new Date(),
                          );
                          if (!isNaN(date.getTime())) {
                            field.onChange(date);
                          }
                        } catch {
                          field.onChange(new Date("invalid"));
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="exemplo@dominio.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite o endereço completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex w-full flex-col justify-between gap-4 pt-5">
          <Button type="submit" className="w-full" disabled={!isValid}>
            Continuar
          </Button>
          <Button className="w-full" variant="ghost" onClick={onBackStep}>
            Voltar
          </Button>
        </div>
      </form>
    </Form>
  );
}
