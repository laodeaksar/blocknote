import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import { SLASH_ITEMS, SlashMenu, type SlashMenuItem, type SlashMenuRef } from "@/components/editor/slash-menu";

function filterItems(query: string): SlashMenuItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)
  );
}

const slashSuggestion: Omit<SuggestionOptions, "editor"> = {
  char: "/",
  allowSpaces: false,
  startOfLine: false,
  command({ editor, range, props }) {
    const item = props as SlashMenuItem;
    editor.chain().focus().deleteRange(range).run();
    item.command(editor);
  },
  items({ query }) {
    return filterItems(query);
  },
  render() {
    let renderer: ReactRenderer<SlashMenuRef, object>;

    return {
      onStart(props) {
        renderer = new ReactRenderer(SlashMenu, {
          props: {
            ...props,
            editor: props.editor,
          },
          editor: props.editor,
        });
      },

      onUpdate(props) {
        renderer.updateProps({
          ...props,
          editor: props.editor,
        });
      },

      onKeyDown({ event }) {
        if (event.key === "Escape") {
          renderer.destroy();
          return true;
        }
        return renderer.ref?.onKeyDown(event) ?? false;
      },

      onExit() {
        renderer.destroy();
      },
    };
  },
};

export const SlashExtension = Extension.create({
  name: "slash",
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...slashSuggestion,
      }),
    ];
  },
});
