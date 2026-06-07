import { redirect } from "next/navigation";
export default function CreateAliasRedirect() {
  redirect("/app/settings/aliases/create");
}
