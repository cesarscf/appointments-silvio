import { z } from "zod";

import { and, eq, gte, lt, lte, or } from "@acme/db";
import { db } from "@acme/db/client";
import {
  appointments,
  openingHours,
  services,
  unavailabilities,
} from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

const getAvailableSlotsInput = z.object({
  establishmentId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Formato YYYY-MM-DD
});

const getAvailableSlotsOutput = z.array(
  z.object({
    startTime: z.string(), // Formato ISO 8601
    endTime: z.string(), // Formato ISO 8601
    employeeId: z.string().uuid().optional(),
  }),
);

export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsInput>;
export type GetAvailableSlotsOutput = z.infer<typeof getAvailableSlotsOutput>;

export const appointmentRouter = {
  createAppointment: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        serviceId: z.string(),
        startTime: z.string(), // Data e hora no formato ISO (ex: "2023-10-15T14:00:00")
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { employeeId, serviceId, startTime } = input;

      // Buscar o serviço para obter a duração
      const [service] = await ctx.db
        .select()
        .from(services)
        .where(eq(services.id, serviceId));

      if (!service) {
        throw new Error("Serviço não encontrado");
      }

      // Calcular o horário de término
      const start = new Date(startTime);
      const end = new Date(start.getTime() + service.duration * 60000);

      // Verificar se o funcionário está disponível no horário
      const isUnavailable = await ctx.db
        .select()
        .from(unavailabilities)
        .where(
          and(
            eq(unavailabilities.employeeId, employeeId),
            or(
              and(
                gte(unavailabilities.startTime, start),
                lt(unavailabilities.startTime, end),
              ),
              and(
                gte(unavailabilities.endTime, start),
                lt(unavailabilities.endTime, end),
              ),
            ),
          ),
        );

      if (isUnavailable.length > 0) {
        throw new Error("Funcionário indisponível no horário selecionado");
      }

      // Verificar se já existe um agendamento no mesmo horário
      const existingAppointment = await ctx.db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.employeeId, employeeId),
            or(
              and(
                gte(appointments.startTime, start),
                lt(appointments.startTime, end),
              ),
              and(
                gte(appointments.endTime, start),
                lt(appointments.endTime, end),
              ),
            ),
          ),
        );

      if (existingAppointment.length > 0) {
        throw new Error("Já existe um agendamento no horário selecionado");
      }

      // Criar o agendamento
      const [appointment] = await ctx.db
        .insert(appointments)
        .values({
          employeeId,
          serviceId,
          startTime: start,
          endTime: end,
        })
        .returning();

      return appointment;
    }),
  listAppointmentsByEmployee: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { employeeId } = input;
      const data = await ctx.db.query.appointments.findFirst({
        where: eq(appointments.employeeId, employeeId),
        with: {
          employee: true,
          service: true,
        },
      });

      return data;
    }),
  listAppointments: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.appointments.findMany({
      where: eq(appointments.establishmentId, ctx.establishmentId),
      with: {
        employee: true,
        service: true,
        customer: true,
      },
    });

    return data;
  }),
  getAvailableSlots: publicProcedure
    .input(getAvailableSlotsInput)
    .output(getAvailableSlotsOutput)
    .query(async ({ input }) => {
      const { establishmentId, date } = input;

      // 1. Buscar os horários de funcionamento do estabelecimento
      const openingHoursResult = await db
        .select()
        .from(openingHours)
        .where(eq(openingHours.establishmentId, establishmentId));

      // 2. Buscar todos os agendamentos para o dia especificado
      const appointmentsResult = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.establishmentId, establishmentId),
            gte(appointments.startTime, new Date(`${date}T00:00:00`)),
            lte(appointments.endTime, new Date(`${date}T23:59:59`)),
          ),
        );

      // 3. Buscar todas as indisponibilidades dos funcionários para o dia especificado
      const unavailabilitiesResult = await db
        .select()
        .from(unavailabilities)
        .where(
          and(
            gte(unavailabilities.startTime, new Date(`${date}T00:00:00`)),
            lte(unavailabilities.endTime, new Date(`${date}T23:59:59`)),
          ),
        );

      // 4. Filtrar os horários disponíveis
      const availableSlots: GetAvailableSlotsOutput = [];

      for (const openingHour of openingHoursResult) {
        const dayOfWeek = new Date(date).getDay();
        if (openingHour.dayOfWeek === dayOfWeek) {
          const startTime = new Date(`${date}T${openingHour.openingTime}`);
          const endTime = new Date(`${date}T${openingHour.closingTime}`);

          // Verificar se há agendamentos ou indisponibilidades nesse intervalo
          const isSlotAvailable = !appointmentsResult.some((appointment) => {
            const appointmentStart = new Date(appointment.startTime);
            const appointmentEnd = new Date(appointment.endTime);
            return (
              (appointmentStart >= startTime && appointmentStart < endTime) ||
              (appointmentEnd > startTime && appointmentEnd <= endTime)
            );
          });

          if (isSlotAvailable) {
            availableSlots.push({
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
            });
          }
        }
      }

      return availableSlots;
    }),
};
