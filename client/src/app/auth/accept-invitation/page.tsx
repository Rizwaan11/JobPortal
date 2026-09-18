import AcceptInvitationForm from "./accept-invitation-form";

type Props = {
  searchParams: Promise<{ token?: string | string[]; email?: string | string[] }>;
};

export default async function AcceptInvitationPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <AcceptInvitationForm
      token={typeof params.token === "string" ? params.token : ""}
      initialEmail={typeof params.email === "string" ? params.email : ""}
    />
  );
}
