import { Suspense } from "react";
import { MailFolderView } from "@/components/mail/mail-folder-view";

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="p-4">Loading archive…</div>}>
      <MailFolderView folder="ARCHIVE" title="Archive" />
    </Suspense>
  );
}
