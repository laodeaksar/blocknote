import { Mark } from "@tiptap/core";

export const CommentHighlight = Mark.create({
  name: "commentHighlight",

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-thread-id"),
        renderHTML: (attrs) =>
          attrs.threadId ? { "data-thread-id": attrs.threadId } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "mark[data-thread-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "mark",
      {
        "data-thread-id": HTMLAttributes.threadId,
        class: "comment-highlight",
      },
      0,
    ];
  },
});
