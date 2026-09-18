import RegisterForm from "./register-form";

type Props = {
  searchParams: Promise<{ invite?: string | string[]; email?: string | string[] }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <RegisterForm
      inviteToken={typeof params.invite === "string" ? params.invite : ""}
      initialEmail={typeof params.email === "string" ? params.email : ""}
    />
  );
}
