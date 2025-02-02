"use client";

import { notFound, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function StorePage() {
  const { slug } = useParams();

  const [data] = api.store.getBySlug.useSuspenseQuery({
    slug: slug as string,
  });

  if (!data) {
    return notFound();
  }

  return (
    <div className={cn(`theme-${data.theme}`)}>
      <h1>{data.name}</h1>
      <div>
        {data.services.map((service) => (
          <div key={service.id} className="flex flex-col">
            {service.name}
          </div>
        ))}
      </div>
      <Button>Button</Button>
    </div>
  );
}
