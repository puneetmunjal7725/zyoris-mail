import { Suspense } from "react";
import { MailFolderView } from "@/components/mail/mail-folder-view";

export default function SpamPage() {
  return (
    <Suspense>
      <MailFolderView folder="SPAM" title="Spam" />
    </Suspense>
  );
}
