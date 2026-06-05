import { Suspense } from "react";
import { MailFolderView } from "@/components/mail/mail-folder-view";

export default function SentPage() {
  return (
    <Suspense>
      <MailFolderView folder="SENT" title="Sent" />
    </Suspense>
  );
}
