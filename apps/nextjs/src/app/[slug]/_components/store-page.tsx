"use client";

import React from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { CalendarDays, Clock, MapPin, Phone, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { AboutSection } from "./about-section";
import { EmployeesList } from "./employees-list";
import { Footer } from "./footer-sections";
import { MapSection } from "./map-section";
import { PackagesList } from "./service-package-list";
import { ServicesList } from "./services-list";

export function StorePage() {
  const { slug } = useParams();

  const [searchTermEmployees, setSearchTermEmployees] = React.useState("");
  const [searchTermServices, setSearchTermServices] = React.useState("");

  const [data] = api.establishment.getEstablishmentBySlug.useSuspenseQuery({
    slug: slug as string,
  });

  if (!data) {
    return notFound();
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const filteredEmployees = data.employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTermEmployees.toLowerCase()),
  );

  const filteredServices = data.services.filter((service) =>
    service.name.toLowerCase().includes(searchTermServices.toLowerCase()),
  );

  return (
    <main className={cn(`theme-${data.theme} min-h-screen`)}>
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 py-3 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full md:h-16 md:w-16">
              <Image
                src={data.logo ?? "/placeholder.svg"}
                alt={`${data.name} Logo`}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold md:text-2xl">{data.name}</h1>
            </div>
          </div>
          <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-3 md:mt-0 md:w-auto md:justify-end">
            <a className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted">
              <Phone className="h-4 w-4" />
              <span>{"(27) 12345-7890"}</span>
            </a>
            <a
              href={"5531976342570"}
              className="flex items-center gap-1 rounded-md bg-green-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <div className="relative mb-8 h-[40vh] overflow-hidden md:h-[50vh]">
        <Image
          src={data.banner ?? "/placeholder.svg"}
          alt={`${data.name} - Capa`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-4 text-sm  md:gap-6">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{"Av. Principal, 123 - Centro"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{"Seg-Sáb: 09:00-19:00"}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>Agendamento online disponível</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sticky top-[72px] z-10 mb-8 border-b bg-background/95 backdrop-blur md:top-[80px]">
        <div className="container mx-auto px-4">
          <div className="no-scrollbar flex w-full justify-between gap-2 overflow-x-auto py-3 sm:justify-start sm:gap-6">
            <button
              onClick={() => scrollToSection("services")}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary focus:bg-muted focus:text-primary"
            >
              Serviços
            </button>
            <button
              onClick={() => scrollToSection("professionals")}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary focus:bg-muted focus:text-primary"
            >
              Profissionais
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary focus:bg-muted focus:text-primary"
            >
              Sobre e Localização
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Combined About and Location Section */}

        <section id="about" className="mb-16 scroll-mt-32">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Sobre Nós e Localização</h2>
            <p className="text-muted-foreground">
              Conheça mais sobre nossa história, valores e como nos encontrar
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col">
              <AboutSection about={data.about} />
            </div>
            <div className="flex flex-col">
              <MapSection />
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        <section id="services" className="mb-16 scroll-mt-32">
          <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold">Nossos Serviços</h2>
              <p className="text-muted-foreground">
                Selecione um serviço para agendar seu horário
              </p>
              <Input
                type="text"
                placeholder="Filtrar por nome"
                value={searchTermServices}
                onChange={(e) => setSearchTermServices(e.target.value)}
                className="mt-2 w-[300px]"
              />
            </div>
          </div>

          <ServicesList services={filteredServices} slug={data.slug} />
        </section>

        <section id="services" className="mb-16 scroll-mt-32">
          <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold">Nossos pacotes</h2>
              <p className="text-muted-foreground">
                Selecione um serviço para agendar seu horário
              </p>
              <Input
                type="text"
                placeholder="Filtrar por nome"
                value={searchTermServices}
                onChange={(e) => setSearchTermServices(e.target.value)}
                className="mt-2 w-[300px]"
              />
            </div>
          </div>

          <PackagesList packages={data.servicePackages} slug={data.slug} />
        </section>

        <section id="professionals" className="mb-16 scroll-mt-32">
          <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold">Nossos Profissionais</h2>
              <p className="text-muted-foreground">
                Escolha seu profissional preferido
              </p>
              <Input
                type="text"
                placeholder="Filtrar por nome"
                value={searchTermEmployees}
                onChange={(e) => setSearchTermEmployees(e.target.value)}
                className="mt-2 w-[300px]"
              />
            </div>
          </div>
          <EmployeesList employees={filteredEmployees} slug={data.slug} />
        </section>
      </div>

      <Footer storeName={data.name} />
    </main>
  );
}
