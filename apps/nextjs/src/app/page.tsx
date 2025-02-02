import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HydrateClient } from "@/trpc/server";

export const runtime = "edge";

export default function HomePage() {
  return (
    <HydrateClient>
      <main className="container h-screen py-16">
        <Button asChild>
          <Link href={"/login"}>Entrar</Link>
        </Button>
      </main>
    </HydrateClient>
  );
}
