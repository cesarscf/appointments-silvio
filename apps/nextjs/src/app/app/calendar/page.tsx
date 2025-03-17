import { api, HydrateClient } from "@/trpc/server";
import Calendar from "./_components/calendar";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ organization: string; project: string }>;
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  void api.appointment.listAppointments.prefetch();

  return (
    <HydrateClient>
      <Calendar />
    </HydrateClient>
  );
}
