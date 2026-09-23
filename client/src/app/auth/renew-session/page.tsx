import { getSafeReturnPath } from "@/lib/roles";
import { RenewSession } from "./renew-session";

type Props = {
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

export default async function RenewSessionPage({ searchParams }: Props) {
  const params = await searchParams;
  const requestedPath =
    typeof params.returnTo === "string" ? params.returnTo : null;
  const returnTo = getSafeReturnPath(requestedPath, "/");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <RenewSession returnTo={returnTo} />
    </main>
  );
}
