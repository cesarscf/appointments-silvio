import { MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MapSectionProps {
  googleMapsLink: string | null;
  address: string | null;
}

export function MapSection({ googleMapsLink, address }: MapSectionProps) {
  return (
    <div id="como-chegar" className="rounded-lg border p-6 shadow">
      <h3 className="text-xl font-bold mb-4">COMO CHEGAR</h3>
      <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{address || "RUA SILVEIRA, 40 ESTRELA DALVA BH-MG"}</span>
      </p>
      <div className="space-y-4">
        <div
          className="relative aspect-video overflow-hidden rounded-lg bg-muted"
          style={{
            backgroundImage: `url('/maps-placeholder.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />

          {/* Botão centralizado */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button asChild size="lg" className="shadow-lg">
              <Link
                href={googleMapsLink || "https://maps.google.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Navigation className="h-5 w-5" />
                <span>Ver no Google Maps</span>
              </Link>
            </Button>
          </div>

          {/* Ícone de localização no canto */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
              <MapPin className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
