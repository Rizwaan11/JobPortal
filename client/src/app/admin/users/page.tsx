import { Users } from "lucide-react";

import { AdminActionButton } from "@/components/admin-action-button";
import { EmptyState } from "@/components/empty-state";
import { FilterPills } from "@/components/filter-pills";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { formatDate, formatLabel } from "@/lib/format";

import { activateUser, suspendUser } from "./actions";

type User = {
  _id: string;
  email: string;
  role: "recruiter" | "applicant" | "admin";
  status: "unverified" | "active" | "suspended";
  createdAt: string;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; role?: string }>;
}) {
  const { status, role } = await searchParams;
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (role) query.set("role", role);
  const qs = query.toString();
  const data = await apiFetch(`/api/admin/users${qs ? `?${qs}` : ""}`);
  const users: User[] = data.users ?? [];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Users"
        description="Review account roles and manage access across the platform."
      />
      <FilterPills
        label="User status"
        items={[
          { href: "/admin/users", label: "All", active: !status },
          ...["unverified", "active", "suspended"].map((item) => ({
            href: `/admin/users?status=${item}`,
            label: formatLabel(item),
            active: status === item,
          })),
        ]}
      />

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="No user accounts match this status filter."
        />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead className="bg-muted/60 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{user.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatLabel(user.role)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            user.status === "suspended"
                              ? "destructive"
                              : user.status === "active"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {formatLabel(user.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <AdminActionButton
                            action={activateUser}
                            id={user._id}
                            label="Activate"
                            disabled={user.status !== "suspended"}
                          />
                          <AdminActionButton
                            action={suspendUser}
                            id={user._id}
                            label="Suspend"
                            disabled={user.status === "suspended"}
                            confirmation={{
                              title: "Suspend user?",
                              description:
                                "This user will be unable to access their account until an administrator activates it again.",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
