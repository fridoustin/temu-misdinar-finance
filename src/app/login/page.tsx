import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getAdmin } from "@/infrastructure/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/");
  return <LoginForm />;
}