import { redirectAuthenticatedUser } from "@/lib/server-auth";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  await redirectAuthenticatedUser();
  return <LoginForm />;
}
