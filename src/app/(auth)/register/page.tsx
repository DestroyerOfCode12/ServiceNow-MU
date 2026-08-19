import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { RegisterForm } from "./register-form";

// See login/page.tsx for the same reasoning: a server component wrapper so
// an already-authenticated visitor gets a real server-side redirect, with
// the interactive form (useState/fetch/signIn) split into a client sibling.
export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return <RegisterForm />;
}
