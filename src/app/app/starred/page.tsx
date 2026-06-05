import { Suspense } from "react";
import { MailFolderView } from "@/components/mail/mail-folder-view";

export default function StarredPage() {
  return (
    <Suspense>
      <MailFolderView folder="STARRED" title="Starred" />
    </Suspense>
  );
}
