import { Suspense } from "react";
import { MailFolderView } from "@/components/mail/mail-folder-view";

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading inbox…</div>}>
      <MailFolderView folder="INBOX" title="Inbox" />
    </Suspense>
  );
}
