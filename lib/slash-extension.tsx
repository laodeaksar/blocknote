"use client";

import { Extension, ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import { SlashMenu, type SlashMenuItem } from "@/components/slash-menu";
import {
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Code2,
  Quote,
  Minus,
} from "lucide-react";

export interface SlashCommandItem extends SlashMenuItem {}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    group: "Teks",
    title: "Paragraf",
    description: "Teks biasa",
    icon: Pilcrow,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    group: "Teks",
    title: "Judul 1",
    description: "Judul besar",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    group: "Teks",
    title: "Judul 2",
    description: "Judul sedang",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    group: "Teks",
    title: "Judul 3",
    description: "Judul kecil",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    group: "Daftar",
    title: "Daftar Bullet",
    description: "Daftar tidak berurutan",
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    group: "Daftar",
    title: "Daftar Angka",
    description: "Daftar berurutan",
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    group: "Daftar",
    title: "Daftar Tugas",
    description: "Daftar dengan kotak centang",
    icon: ListTodo,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    group: "Format",
    title: "Blok Kode",
    description: "Kode dengan highlight sintaks",
    icon: Code2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    group: "Format",
    title: "Kutipan",
    description: "Blok kutipan teks",
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    group: "Format",
    title: "Garis Pemisah",
    description: "Garis horizontal",
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

type MenuRef = { onKeyDown: (props: { event: KeyboardEvent }) => boolean };

function renderSlashMenu() {
  let renderer: ReactRenderer<MenuRef> | null = null;

  return {
    onStart(props: SuggestionProps<SlashCommandItem>) {
      renderer = new ReactRenderer(SlashMenu, {
        props,
        editor: props.editor,
      });
    },

    onUpdate(props: SuggestionProps<SlashCommandItem>) {
      renderer?.updateProps(props);
    },

    onKeyDown(props: SuggestionKeyDownProps): boolean {
      if (props.event.key === "Escape") {
        renderer?.destroy();
        renderer = null;
        return true;
      }
      return renderer?.ref?.onKeyDown(props) ?? false;
    },

    onExit() {
      renderer?.destroy();
      renderer = null;
    },
  };
}

export const SlashExtension = Extension.create({
  name: "slash",

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        items: ({ query }) => {
          const q = query.toLowerCase().trim();
          if (!q) return SLASH_COMMANDS;
          return SLASH_COMMANDS.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.group.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q)
          );
        },
        render: renderSlashMenu,
      }),
    ];
  },
});
