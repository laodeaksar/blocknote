import { useState, useRef, useEffect } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

export function NavbarTitle({
  title,
  onSave,
  isPending
}: {
  title: string;
  onSave: (title: string) => Promise<void>
  isPending?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const start = () => {
    setDraft(title);
    setIsEditing(true);
  };

  const commit = async () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed!== title) await onSave(trimmed);
    setIsEditing(false);
  };

  const cancel = () => setIsEditing(false);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    else if (e.key === "Escape") cancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 min-w-0 flex-1">
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className="h-7 text-sm font-medium border-0 border-b border-border rounded-none shadow-none bg-transparent px-1 focus-visible:ring-0 focus-visible:border-primary min-w-0 flex-1"
        maxLength={100}
      />
      {isPending && <Loader2 className="size-3 animate-spin" />}
      </div>
    );
  }

  return (
    <button onClick={start} className="group flex items-center gap-1.5 min-w-0 text-left">
      <span className="text-sm font-medium text-foreground truncate">
        {title || "Untitled"}
      </span>
      <Pencil className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
    </button>
  );
}