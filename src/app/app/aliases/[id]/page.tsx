import { redirect } from "next/navigation";

export default async function AliasDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/app/settings/aliases/${id}`);
}
