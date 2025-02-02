import type { Metadata } from "next";

import { SignUpForm } from "@/app/(auth)/_components/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Cadastrar-se",
  description: "Crie uma conta",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Cadastrar-se</CardTitle>
          <CardDescription>
            Faça cadastro com sua conta Google ou GitHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="grid gap-6">
              <SignUpForm />
              <div className="text-center text-sm">
                Já possui uma conta?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Entrar
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        Ao clicar em continuar, você concorda com nossos{" "}
        <a href="/#">Termos de Serviço</a> e{" "}
        <a href="/#">Política de Privacidade</a>.
      </div>
    </div>
  );
}
