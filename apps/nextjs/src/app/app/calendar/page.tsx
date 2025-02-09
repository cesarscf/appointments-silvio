import { api, HydrateClient } from "@/trpc/server";
import Calendar from "./_components/calendar";

export default function Page() {
  void api.appointment.all.prefetch();

  return (
    <HydrateClient>
      <Calendar />
    </HydrateClient>
  );
}
