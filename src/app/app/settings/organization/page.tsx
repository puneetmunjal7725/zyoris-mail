"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";

export default function SettingsOrganizationPage() {
  const [org, setOrg] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"USER" | "ORG_ADMIN">("USER");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const orgs = await clientApi<any[]>("/api/organizations");
    const current = orgs[0];
    setOrg(current);
    if (current) setName(current.name);
    setUsers(await clientApi("/api/users"));
    setInvites(await clientApi("/api/invitations"));
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (!org) return <SettingsShell title="Organization"><Card>Loading…</Card></SettingsShell>;

  return (
    <SettingsShell title="Organization">
      <div className="space-y-4">
        <Card>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workspace name" />
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <Button className="mt-3" onClick={async () => {
            await clientApi("/api/organizations", { method: "PATCH", body: JSON.stringify({ name, userLimit: org.userLimit, storageLimitBytes: org.storageLimitBytes }) });
            await refresh();
          }}>
            Save
          </Button>
        </Card>

        <Card>
          <h3 className="font-medium">Team members</h3>
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
                  <option value="USER">Member</option>
                  <option value="ORG_ADMIN">Admin</option>
                </select>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-medium">Invite people</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Input placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Button onClick={async () => {
              await clientApi("/api/invitations", { method: "POST", body: JSON.stringify({ organizationId: org._id, email: inviteEmail, role: inviteRole }) });
              setInviteEmail("");
              await refresh();
            }}>
              Send invite
            </Button>
          </div>
        </Card>
      </div>
    </SettingsShell>
  );
}
