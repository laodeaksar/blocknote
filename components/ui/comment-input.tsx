"use client";

import * as React from "react";
import { Send } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  rows?: number;
  className?: string;
  textareaClassName?: string;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
}

export function CommentInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = "Tulis komentar…",
  disabled = false,
  autoFocus = false,
  rows = 3,
  className,
  textareaClassName,
  textareaRef,
}: CommentInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === "Escape") {
      onCancel?.();
    }
  };

  return (
    <InputGroup className={cn("rounded-lg", className)}>
      <InputGroupTextarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autoFocus}
        className={cn("text-sm py-2 px-3", textareaClassName)}
        onKeyDown={handleKeyDown}
      />
      <InputGroupAddon
        align="block-end"
        className="justify-between border-t border-border px-2 py-1"
      >
        <InputGroupText className="text-xxs text-muted-foreground/60">
          Ctrl+Enter
        </InputGroupText>
        <div className="flex items-center gap-1">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onCancel}
              disabled={disabled}
            >
              Batal
            </Button>
          )}
          <InputGroupButton
            variant="default"
            size="xs"
            disabled={!value.trim() || disabled}
            onClick={onSubmit}
          >
            <Send data-icon="inline-start" />
            Kirim
          </InputGroupButton>
        </div>
      </InputGroupAddon>
    </InputGroup>
  );
}
