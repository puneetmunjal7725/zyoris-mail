"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import { Button } from "@/components/ui/button";

const lowlight = createLowlight();

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[220px] rounded-xl border border-[#D8DCE8] p-3 outline-none dark:border-[#2C3040]",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>Bold</Button>
        <Button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</Button>
        <Button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</Button>
        <Button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>List</Button>
        <Button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code</Button>
        <Button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
