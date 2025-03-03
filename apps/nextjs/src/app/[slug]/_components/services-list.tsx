"use client";

import { BeakerIcon, Scissors } from "lucide-react";

import { Service } from "@acme/db/schema";

import { Button } from "@/components/ui/button";

export function ServicesList({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="group overflow-hidden rounded-lg border transition-colors"
        >
          <div className="relative h-48 w-full">
            <img
              src={service.image || "/placeholder.svg"}
              alt={service.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute right-3 top-3 rounded-md bg-green-500 px-2 py-1 text-sm font-bold text-white">
              {service.price}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-md p-2">
                <Scissors className="h-5 w-5" />
              </div>
              <h3 className="font-bold">{service.name}</h3>
            </div>
            <p className="mb-3 text-sm">{service.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Duração: {service.estimatedTime}</span>

              <Button className="text-white">Agendar</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
