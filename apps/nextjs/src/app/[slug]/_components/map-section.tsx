import Image from "next/image";
import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ServicesList } from "./services-list";

export function MapSection() {
  return (
    <div id="como-chegar" className="rounded-lg border p-6 shadow">
      <h3 className="text-xl font-bold">COMO CHEGAR</h3>
      <p className="mb-4 flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4" />
        <span>RUA SILVEIRA, 40 ESTRELA DALVA BH-MG</span>
      </p>
      <div className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {/* <Image
            src="/placeholder.svg"
            alt="Mapa de localização"
            fill
            className="object-cover"
          /> */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button asChild>
              <Link
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors"
              >
                <Navigation className="h-4 w-4" />
                <span>Ver no Google Maps</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
