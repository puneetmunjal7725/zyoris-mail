import { Suspense } from "react";
import { MailFolderView } from "@/components/mail/mail-folder-view";

export default function TrashPage() {
  return (
    <Suspense>
      <MailFolderView folder="TRASH" title="Trash" />
    </Suspense>
  );
}
