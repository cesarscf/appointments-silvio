import { LoginForm } from "@/app/(auth)/_components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
          <CardDescription>Faça login com sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="grid gap-6">
              <LoginForm />
              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Cadastre-se
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
