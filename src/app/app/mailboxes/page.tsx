import { redirect } from "next/navigation";
export default function MailboxesRedirect() {
  redirect("/app/settings/team");
}
