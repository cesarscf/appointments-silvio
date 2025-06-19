import { db } from "@acme/db/client"; // Importe a instância do seu banco de dados
import {
  appointments,
  categories,
  customers, // Importe a tabela de customers
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

const userId = "X8cbgP7rl9XKPPt8Du0myCCWwSTk05Wr";

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
  await db.delete(customers); // Deleta os clientes
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

  if (!establishment) {
    throw new Error("Falha ao criar o estabelecimento.");
  }

  console.log("Estabelecimento criado com sucesso:", establishment);

  // Cria dias de funcionamento (openingHours)
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const openingHoursData = daysOfWeek.map((day) => ({
    establishmentId: establishment.id, // Usando o ID do estabelecimento criado
    dayOfWeek: day,
    openingTime: "09:00", // Horário de abertura
    closingTime: "18:00", // Horário de fechamento
  }));

  const createdOpeningHours = await db
    .insert(openingHours)
    .values(openingHoursData)
    .returning();

  console.log(
    "Horários de funcionamento criados com sucesso:",
    createdOpeningHours,
  );

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

  console.log("Intervalos de horários criados com sucesso.");

  // Cria alguns funcionários
  const [employee1, employee2] = await db
    .insert(employees)
    .values([
      {
        establishmentId: establishment.id,
        name: "Funcionário 1",
      },
      {
        establishmentId: establishment.id,
        name: "Funcionário 2",
      },
    ])
    .returning();

  if (!employee1 || !employee2) {
    throw new Error("Falha ao criar os profissionais.");
  }

  const today = new Date();

  // Cria indisponibilidades para os funcionários
  const unavailabilitiesData = [
    {
      employeeId: employee1.id,
      dayOfWeek: 5, // Sexta-feira
      startTime: "14:00", // Indisponível das 14h às 15h na sexta-feira
      endTime: "15:00",
    },
    {
      employeeId: employee1.id,
      dayOfWeek: 6, // Sábado
      startTime: "00:00", // Indisponível o dia todo no sábado
      endTime: "23:59",
    },
    {
      employeeId: employee2.id,
      dayOfWeek: 1, // Segunda-feira
      startTime: "10:00", // Indisponível das 10h às 11h na segunda-feira
      endTime: "11:00",
    },
    {
      employeeId: employee2.id,
      dayOfWeek: 0, // Domingo
      startTime: "00:00", // Indisponível o dia todo no domingo
      endTime: "23:59",
    },
  ];

  await db.insert(unavailabilities).values(unavailabilitiesData);

  console.log("Indisponibilidades criadas com sucesso.");

  // Cria algumas categorias
  const [category1, category2] = await db
    .insert(categories)
    .values([
      {
        name: "Corte de Cabelo",
        establishmentId: establishment.id,
      },
      {
        name: "Manicure",
        establishmentId: establishment.id,
      },
    ])
    .returning();

  if (!category1 || !category2) {
    throw new Error("Falha ao criar as categorias.");
  }

  console.log("Categorias criadas com sucesso:", category1, category2);

  // Cria alguns serviços
  const [service1, service2] = await db
    .insert(services)
    .values([
      {
        establishmentId: establishment.id,
        name: "Corte Masculino",
        duration: 30,
        price: "30.00",
      },
      {
        establishmentId: establishment.id,
        name: "Manicure Completa",
        duration: 60,
        price: "50.00",
      },
    ])
    .returning();

  if (!service1 || !service2) {
    throw new Error("Falha ao criar os serviços.");
  }

  console.log("Serviços criados com sucesso:", service1, service2);

  // Associa serviços às categorias
  await db.insert(serviceCategories).values([
    {
      serviceId: service1.id,
      categoryId: category1.id,
    },
    {
      serviceId: service2.id,
      categoryId: category2.id,
    },
  ]);

  console.log("Serviços associados às categorias com sucesso.");

  // Associa serviços aos funcionários
  await db.insert(employeeServices).values([
    {
      employeeId: employee1.id,
      serviceId: service1.id,
      commission: "10.00",
    },
    {
      employeeId: employee2.id,
      serviceId: service2.id,
      commission: "15.00",
    },
  ]);

  console.log("Serviços associados aos profissionais com sucesso.");

  // Cria alguns clientes
  const [customer1, customer2] = await db
    .insert(customers)
    .values([
      {
        establishmentId: establishment.id,
        name: "Cliente 1",
        cpf: "123.456.789-00",
        birthDate: new Date("1990-01-01"),
        phoneNumber: "(11) 99999-9999",
        email: "cliente1@example.com",
        address: "Rua A, 123",
      },
      {
        establishmentId: establishment.id,
        name: "Cliente 2",
        cpf: "987.654.321-00",
        birthDate: new Date("1985-05-15"),
        phoneNumber: "(11) 88888-8888",
        email: "cliente2@example.com",
        address: "Rua B, 456",
      },
    ])
    .returning();

  if (!customer1 || !customer2) {
    throw new Error("Falha ao criar os clientes.");
  }

  console.log("Clientes criados com sucesso:", customer1, customer2);

  const appointmentsData = Array.from({ length: 10 }, (_, i) => {
    const appointmentDate = new Date();
    appointmentDate.setDate(today.getDate() + i);
    appointmentDate.setHours(10 + i, 0, 0, 0);

    return {
      employeeId: i % 2 === 0 ? employee1.id : employee2.id,
      serviceId: i % 2 === 0 ? service1.id : service2.id,
      establishmentId: establishment.id,
      customerId: i % 2 === 0 ? customer1.id : customer2.id,
      startTime: appointmentDate,
      endTime: new Date(appointmentDate.getTime() + 30 * 60000),
    };
  });

  await db.insert(appointments).values(appointmentsData);

  console.log("Agendamentos criados com sucesso.");

  console.log("Seed concluído com sucesso!");
}
