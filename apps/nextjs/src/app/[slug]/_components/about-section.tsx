import { CheckCircle, Clock, Users } from "lucide-react";

export function AboutSection({
  about,
  activeCustomers,
  experienceTime,
  servicesPerformed,
}: {
  about: string | null;
  activeCustomers: number | null;
  experienceTime: number | null;
  servicesPerformed: number | null;
}) {
  const hasMetrics = activeCustomers || experienceTime || servicesPerformed;
  return (
    <div id="sobre" className="rounded-lg border p-6 shadow">
      <h3 className="mb-4 text-xl font-bold">SOBRE NÓS</h3>
      <div className="h-full space-y-4">
        <p>{about}</p>
      </div>
      {hasMetrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4">
          {activeCustomers && (
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
              <Users className="h-8 w-8 text-primary mb-2" />
              <span className="text-2xl font-bold text-primary">
                {activeCustomers.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground text-center">
                Clientes Ativos
              </span>
            </div>
          )}

          {experienceTime && (
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <span className="text-2xl font-bold text-primary">
                {experienceTime}+
              </span>
              <span className="text-sm text-muted-foreground text-center">
                Anos de Experiência
              </span>
            </div>
          )}

          {servicesPerformed && (
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <span className="text-2xl font-bold text-primary">
                {servicesPerformed.toLocaleString()}+
              </span>
              <span className="text-sm text-muted-foreground text-center">
                Serviços Realizados
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
