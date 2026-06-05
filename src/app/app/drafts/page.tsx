import { Suspense } from "react";
import { MailFolderView } from "@/components/mail/mail-folder-view";

export default function DraftsPage() {
  return (
    <Suspense>
      <MailFolderView folder="DRAFT" title="Drafts" />
    </Suspense>
  );
}
