import { redirect } from "next/navigation";
export default function CreateMailboxRedirect() {
  redirect("/app/settings/team/create");
}
