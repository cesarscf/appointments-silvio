import { db } from "@acme/db/client"; // Importe a instância do seu banco de dados
import {
  appointments,
  categories,
  employees,
  employeeServices,
  establishments,
  intervals,
  openingHours,
  serviceCategories,
  services,
  unavailabilities,
} from "@acme/db/schema";

// Importe os schemas

const userId = "cvanj1LjmyevfwouARMgmvYcu4VsioKH";

export async function seed() {
  // Deleta todos os dados existentes nas tabelas (em ordem reversa para evitar conflitos de chaves estrangeiras)
  await db.delete(appointments);
  await db.delete(unavailabilities);
  await db.delete(employeeServices);
  await db.delete(serviceCategories);
  await db.delete(services);
  await db.delete(categories);
  await db.delete(employees);
  await db.delete(intervals);
  await db.delete(openingHours);
  await db.delete(establishments);

  console.log("Dados antigos deletados com sucesso!");

  // Cria um estabelecimento
  const [establishment] = await db
    .insert(establishments)
    .values({
      userId,
      name: "Meu Estabelecimento",
      slug: "meu-estabelecimento",
    })
    .returning();

  // Cria dias de funcionamento (openingHours)
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const openingHoursData = daysOfWeek.map((day) => ({
    establishmentId: establishment!.id,
    dayOfWeek: day,
    openingTime: "09:00", // Horário de abertura
    closingTime: "18:00", // Horário de fechamento
  }));

  const createdOpeningHours = await db
    .insert(openingHours)
    .values(openingHoursData)
    .returning();

  // Cria intervalos de horários (intervals) para cada dia de funcionamento
  const intervalsData = createdOpeningHours.flatMap((openingHour) => [
    {
      openingHourId: openingHour.id,
      startTime: "09:00",
      endTime: "12:00",
    },
    {
      openingHourId: openingHour.id,
      startTime: "13:00",
      endTime: "18:00",
    },
  ]);

  await db.insert(intervals).values(intervalsData);

  // Cria alguns funcionários
  const [employee1, employee2] = await db
    .insert(employees)
    .values([
      {
        establishmentId: establishment!.id,
        name: "Funcionário 1",
      },
      {
        establishmentId: establishment!.id,
        name: "Funcionário 2",
      },
    ])
    .returning();

  // Cria indisponibilidades para os funcionários (baseado na data atual)
  const today = new Date();
  // Cria indisponibilidades para os funcionários (baseado na data atual)
  const unavailabilitiesData = [
    {
      employeeId: employee1!.id,
      startTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        14,
        0,
        0,
      ), // Indisponível das 14h às 15h hoje
      endTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        15,
        0,
        0,
      ),
    },
    {
      employeeId: employee2!.id,
      startTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        10,
        0,
        0,
      ), // Indisponível das 10h às 11h amanhã
      endTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        11,
        0,
        0,
      ),
    },
  ];

  await db.insert(unavailabilities).values(unavailabilitiesData);

  // Cria algumas categorias
  const [category1, category2] = await db
    .insert(categories)
    .values([
      {
        name: "Corte de Cabelo",
        establishmentId: establishment!.id,
      },
      {
        name: "Manicure",
        establishmentId: establishment!.id,
      },
    ])
    .returning();

  // Cria alguns serviços
  const [service1, service2] = await db
    .insert(services)
    .values([
      {
        establishmentId: establishment!.id,
        name: "Corte Masculino",
        duration: 30,
        price: "30.00",
      },
      {
        establishmentId: establishment!.id,
        name: "Manicure Completa",
        duration: 60,
        price: "50.00",
      },
    ])
    .returning();

  // Associa serviços às categorias
  await db.insert(serviceCategories).values([
    {
      serviceId: service1!.id,
      categoryId: category1!.id,
    },
    {
      serviceId: service2!.id,
      categoryId: category2!.id,
    },
  ]);

  // Associa serviços aos funcionários
  await db.insert(employeeServices).values([
    {
      employeeId: employee1!.id,
      serviceId: service1!.id,
      commission: "10.00",
    },
    {
      employeeId: employee2!.id,
      serviceId: service2!.id,
      commission: "15.00",
    },
  ]);

  // Cria 10 agendamentos (baseado na data atual)
  const appointmentsData = Array.from({ length: 10 }, (_, i) => {
    const appointmentDate = new Date();
    appointmentDate.setDate(today.getDate() + i); // Agenda para os próximos dias
    appointmentDate.setHours(10 + i, 0, 0, 0); // Horário de início (10h, 11h, 12h, etc.)

    return {
      employeeId: i % 2 === 0 ? employee1!.id : employee2!.id, // Alterna entre os funcionários
      serviceId: i % 2 === 0 ? service1!.id : service2!.id, // Alterna entre os serviços
      establishmentId: establishment!.id,
      startTime: appointmentDate,
      endTime: new Date(appointmentDate.getTime() + 30 * 60000), // Duração de 30 minutos
    };
  });

  await db.insert(appointments).values(appointmentsData);

  console.log("Seed concluído com sucesso!");
}

seed().catch((err) => {
  console.error("Erro ao executar o seed:", err);
});
