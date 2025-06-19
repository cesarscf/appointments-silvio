import { getSession } from "@acme/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: React.PropsWithChildren) {
  const session = await getSession();

  if (!session?.user) {
    return redirect("/login");
  }

  const allowedDomain = "agendar.tec.br";
  const isAdminUser = session?.user.email?.endsWith(`@${allowedDomain}`);

  if (!isAdminUser) {
    return redirect("/app");
  }

  return children;
}
