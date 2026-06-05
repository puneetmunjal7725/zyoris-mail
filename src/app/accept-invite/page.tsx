"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="w-full">
      <h1 className="text-xl font-semibold">Accept invitation</h1>
      <div className="mt-4 space-y-3">
        <Input placeholder="Invitation token" value={token} onChange={(e) => setToken(e.target.value)} />
        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          className="w-full"
          onClick={async () => {
            try {
              await clientApi("/api/invitations/accept", { method: "POST", body: JSON.stringify({ token, name, password }) });
              router.push("/login");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to accept invite");
            }
          }}
        >
          Join organization
        </Button>
      </div>
    </Card>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Suspense>
        <AcceptInviteForm />
      </Suspense>
    </div>
  );
}
