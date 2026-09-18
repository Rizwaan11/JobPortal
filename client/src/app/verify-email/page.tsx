import VerifyEmailForm from "./verify-email-form";

type Props = {
  searchParams: Promise<{ email?: string | string[]; invite?: string | string[] }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <VerifyEmailForm
      initialEmail={typeof params.email === "string" ? params.email : ""}
      inviteToken={typeof params.invite === "string" ? params.invite : ""}
    />
  );
}
