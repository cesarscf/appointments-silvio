import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye } from "lucide-react";

import { Customer, LoyaltyBonus, LoyaltyProgram } from "@acme/db/schema";
import { applyPhoneMask } from "@acme/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface LoyaltyRecord {
  id: string;
  customerId: string;
  programId: string;
  accumulatedPoints: number;
  lastUpdated: Date;
  program: LoyaltyProgram;
  customer: Customer;
  bonuses: LoyaltyBonus[];
}

interface LoyaltyTableProps {
  data: LoyaltyRecord[];
}

export default function LoyaltyTable({ data }: LoyaltyTableProps) {
  // Formatar data para o formato brasileiro
  const formatDate = (dateString: Date) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

  return (
    <div className="space-y-6 px-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Programa</TableHead>
              <TableHead>Pontos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  {record.customer.name}
                </TableCell>
                <TableCell>{record.program.name}</TableCell>
                <TableCell>
                  {record.accumulatedPoints} / {record.program.requiredPoints}
                </TableCell>
                <TableCell>
                  {record.program.active ? (
                    <Badge className="bg-green-500">Ativo</Badge>
                  ) : (
                    <Badge variant="destructive">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(record.lastUpdated)}</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Detalhes do Programa de Fidelidade
                        </DialogTitle>
                      </DialogHeader>
                      <LoyaltyDetails record={record} formatDate={formatDate} />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function LoyaltyDetails({
  record,
  formatDate,
}: {
  record: LoyaltyRecord;
  formatDate: (date: Date) => string;
}) {
  return (
    <div className="space-y-6 py-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="bg-muted text-center">
                Informações do Cliente
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Nome</TableCell>
              <TableCell>{record.customer.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Telefone</TableCell>
              <TableCell>
                {applyPhoneMask(record.customer.phoneNumber)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Endereço</TableCell>
              <TableCell>{record.customer.address}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="bg-muted text-center">
                Informações do Programa
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Nome do Programa</TableCell>
              <TableCell>{record.program.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Status</TableCell>
              <TableCell>
                {record.program.active ? (
                  <Badge className="bg-green-500">Ativo</Badge>
                ) : (
                  <Badge variant="destructive">Inativo</Badge>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Pontos Acumulados</TableCell>
              <TableCell>{record.accumulatedPoints}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Pontos Necessários</TableCell>
              <TableCell>{record.program.requiredPoints}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Pontos por Serviço</TableCell>
              <TableCell>{record.program.pointsPerService}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Quantidade do Bônus</TableCell>
              <TableCell>{record.program.bonusQuantity}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Última Atualização</TableCell>
              <TableCell>{formatDate(record.lastUpdated)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {record.bonuses.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={4} className="bg-muted text-center">
                  Bônus Recebidos
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Data de Obtenção</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {record.bonuses.map((bonus, index) => (
                <TableRow key={bonus.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{bonus.quantity}</TableCell>
                  <TableCell>{formatDate(bonus.earnedAt)}</TableCell>
                  <TableCell>
                    {bonus.used ? (
                      <div>
                        <Badge className="bg-amber-500">Utilizado</Badge>
                        <div className="mt-1 text-xs">
                          {bonus.usedAt && formatDate(bonus.usedAt)}
                        </div>
                      </div>
                    ) : (
                      <Badge className="bg-green-500">Disponível</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
