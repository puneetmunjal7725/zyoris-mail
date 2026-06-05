"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";

export default function OrganizationPage() {
  const [org, setOrg] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"USER" | "ORG_ADMIN">("USER");
  const [name, setName] = useState("");
  const [userLimit, setUserLimit] = useState("25");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const orgs = await clientApi<any[]>("/api/organizations");
    const current = orgs[0];
    setOrg(current);
    if (current) {
      setName(current.name);
      setUserLimit(String(current.userLimit));
    }
    setUsers(await clientApi("/api/users"));
    setInvites(await clientApi("/api/invitations"));
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (!org) return <Card>Loading organization…</Card>;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-semibold">Organization settings</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Organization name" />
          <Input value={userLimit} onChange={(e) => setUserLimit(e.target.value)} placeholder="User limit" />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <Button
          className="mt-4"
          onClick={async () => {
            await clientApi("/api/organizations", {
              method: "PATCH",
              body: JSON.stringify({ name, userLimit: Number(userLimit), storageLimitBytes: org.storageLimitBytes }),
            });
            await refresh();
          }}
        >
          Save settings
        </Button>
        <div className="mt-4 text-sm text-[var(--muted)]">
          Storage: {Number(org.storageUsedBytes || 0).toLocaleString()} / {Number(org.storageLimitBytes || 0).toLocaleString()} bytes
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Team members</h3>
        <div className="mt-3 space-y-2">
          {users.map((u) => (
            <div key={String(u._id)} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 text-sm">
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-[var(--muted)]">{u.email}</div>
              </div>
              <select
                className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2"
                value={u.role}
                onChange={async (e) => {
                  await clientApi("/api/users", { method: "PATCH", body: JSON.stringify({ userId: u._id, role: e.target.value }) });
                  await refresh();
                }}
              >
                <option value="USER">User</option>
                <option value="ORG_ADMIN">Org Admin</option>
              </select>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Invitations</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input placeholder="Email to invite" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          <select className="h-10 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "USER" | "ORG_ADMIN")}>
            <option value="USER">User</option>
            <option value="ORG_ADMIN">Org Admin</option>
          </select>
          <Button
            onClick={async () => {
              await clientApi("/api/invitations", {
                method: "POST",
                body: JSON.stringify({ organizationId: org._id, email: inviteEmail, role: inviteRole }),
              });
              setInviteEmail("");
              await refresh();
            }}
          >
            Send invite
          </Button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {invites.map((i) => (
            <div key={String(i._id)} className="rounded-lg border border-[var(--border)] p-3">
              {i.email} • {i.role} • {i.acceptedAt ? "Accepted" : "Pending"}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
