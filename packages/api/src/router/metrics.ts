import { protectedProcedure } from "../trpc";

export const metricsRouter = {
  // 1. Faturamento total completo
  totalRevenue: protectedProcedure.query(async ({ ctx }) => {
    const completedAppointments = await ctx.db.query.appointments.findMany({
      where: (appointments, { eq }) => eq(appointments.status, "completed"),
    });

    return completedAppointments.reduce((sum, appointment) => {
      return (
        sum +
        (appointment.paymentAmount ? Number(appointment.paymentAmount) : 0)
      );
    }, 0);
  }),

  // 2. Faturamento por período (mês atual)
  monthlyRevenue: protectedProcedure.query(async ({ ctx }) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);

    const monthlyAppointments = await ctx.db.query.appointments.findMany({
      where: (appointments, { and, eq, gte, lte }) =>
        and(
          eq(appointments.status, "completed"),
          gte(appointments.startTime, startOfMonth),
          lte(appointments.startTime, endOfMonth),
        ),
    });

    return monthlyAppointments.reduce((sum, appointment) => {
      return (
        sum +
        (appointment.paymentAmount ? Number(appointment.paymentAmount) : 0)
      );
    }, 0);
  }),

  // 3. Faturamento por forma de pagamento
  revenueByPaymentType: protectedProcedure.query(async ({ ctx }) => {
    const appointmentsData = await ctx.db.query.appointments.findMany({
      where: (appointments, { eq }) => eq(appointments.status, "completed"),
    });

    return appointmentsData.reduce(
      (acc, appointment) => {
        const type = appointment.paymentType || "other";
        const amount = appointment.paymentAmount
          ? Number(appointment.paymentAmount)
          : 0;

        if (!acc[type]) {
          acc[type] = 0;
        }
        acc[type] += amount;
        return acc;
      },
      {} as Record<string, number>,
    );
  }),

  // 4. Faturamento por serviço (top 5)
  revenueByService: protectedProcedure.query(async ({ ctx }) => {
    const appointmentsWithServices = await ctx.db.query.appointments.findMany({
      where: (appointments, { eq }) => eq(appointments.status, "completed"),
      with: {
        service: true,
      },
      limit: 5,
    });

    const serviceRevenue = appointmentsWithServices.reduce(
      (acc, appointment) => {
        const serviceName = appointment.service?.name || "Unknown";
        const amount = appointment.paymentAmount
          ? Number(appointment.paymentAmount)
          : 0;

        if (!acc[serviceName]) {
          acc[serviceName] = 0;
        }
        acc[serviceName] += amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(serviceRevenue)
      .sort((a, b) => b[1] - a[1])
      .reduce(
        (obj, [key, value]) => {
          obj[key] = value;
          return obj;
        },
        {} as Record<string, number>,
      );
  }),

  // 5. Faturamento por funcionário (top 3)
  revenueByEmployee: protectedProcedure.query(async ({ ctx }) => {
    const appointmentsWithEmployees = await ctx.db.query.appointments.findMany({
      where: (appointments, { eq }) => eq(appointments.status, "completed"),
      with: {
        employee: true,
      },
      limit: 3,
    });

    const employeeRevenue = appointmentsWithEmployees.reduce(
      (acc, appointment) => {
        const employeeName = appointment.employee?.name || "Unknown";
        const amount = appointment.paymentAmount
          ? Number(appointment.paymentAmount)
          : 0;

        if (!acc[employeeName]) {
          acc[employeeName] = 0;
        }
        acc[employeeName] += amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Ordenar por valor decrescente
    return Object.entries(employeeRevenue)
      .sort((a, b) => b[1] - a[1])
      .reduce(
        (obj, [key, value]) => {
          obj[key] = value;
          return obj;
        },
        {} as Record<string, number>,
      );
  }),
};
