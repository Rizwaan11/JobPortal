import { requireRole } from "@/lib/server-auth";
import AdminNav from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");

  return (
    <div>
      <AdminNav />
      <main className="p-4">{children}</main>
    </div>
  );
}
