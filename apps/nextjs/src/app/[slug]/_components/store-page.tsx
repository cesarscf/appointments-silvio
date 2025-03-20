"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { AboutSection } from "./about-section";
import { Footer } from "./footer-sections";
import { MapSection } from "./map-section";
import { ServicesList } from "./services-list";

export function StorePage() {
  const { slug } = useParams();

  const [data] = api.establishment.getEstablishmentBySlug.useSuspenseQuery({
    slug: slug as string,
  });

  if (!data) {
    return notFound();
  }

  return (
    <main className={cn(`theme-blue min-h-screen`)}>
      <header className="border-b">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 py-4 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
              <Image
                src="placeholder.svg"
                alt="BarbershopAlex Logo"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{data.name}</h1>
              {/* <p className="text-xs">{data.addresses[0]?.state ?? ""}</p> */}
            </div>
          </div>
          <div className="mt-4 flex items-center md:mt-0">
            <a
              href="https://wa.me/5531976342570"
              className="flex items-center gap-2 text-green-500 transition-colors hover:text-green-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="font-bold">{"(27) 12345-7890"}</span>
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-8 h-[40vh] overflow-hidden rounded-lg md:h-[50vh]">
          <Image
            src="/placeholder.svg"
            alt="Barbershop Styles"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <MapSection />
          <AboutSection />
        </div>

        <section>
          <h2 className="mb-2 text-center text-2xl font-bold">
            Nossos Serviços
          </h2>
          <p className="mb-8 text-center">
            Selecione um serviço para agendar seu horário
          </p>
          <ServicesList services={data.services} slug={data.slug} />
        </section>
      </div>

      <Footer storeName={data.name} />
    </main>
  );
}
