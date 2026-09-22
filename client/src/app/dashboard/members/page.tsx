import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError, apiFetch } from "@/lib/api";
import type {
  CompanyMember,
  CompanyRole,
} from "@/types/company-members";

import { InviteMemberForm } from "./invite-member-form";
import { MemberActions } from "./member-actions";

function formatRole(role: CompanyRole) {
  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function loadMembers() {
  try {
    return (await apiFetch("/api/companies/members")) as {
      members: CompanyMember[];
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return null;
    }
    throw error;
  }
}

export default async function MembersPage() {
  const membersData = await loadMembers();

  if (membersData === null) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Member management</CardTitle>
          <CardDescription>
            Only the company owner and HR managers can manage company members.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentUserData = (await apiFetch("/api/auth/me")) as {
    user: { id: string; email: string };
  };
  const currentMember = membersData.members.find(
    (member) => member.userId._id === currentUserData.user.id,
  );

  if (!currentMember) {
    throw new Error("Current company membership was not found");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Company members
        </h1>
        <p className="text-sm text-muted-foreground">
          Invite people and manage their company roles.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Invite member</CardTitle>
          <CardDescription>
            The receiver must use a verified recruiter account to accept the
            invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMemberForm />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {membersData.members.map((member) => (
          <Card key={member._id}>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium">{member.userId.email}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {formatRole(member.companyRole)}
                  </Badge>
                  {member.userId._id === currentUserData.user.id && (
                    <span className="text-xs text-muted-foreground">You</span>
                  )}
                </div>
              </div>

              <MemberActions
                memberId={member._id}
                memberRole={member.companyRole}
                memberUserId={member.userId._id}
                currentUserId={currentUserData.user.id}
                currentCompanyRole={currentMember.companyRole}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
