import React from "react";
// editor
import { EditorReadOnlyRefApi, IRichTextReadOnlyEditor, RichTextReadOnlyEditorWithRef } from "@plane/editor";
// helpers
import { cn } from "@/helpers/common.helper";
import { getReadOnlyEditorFileHandlers } from "@/helpers/editor.helper";
// hooks
import { useMention } from "@/hooks/use-mention";

type RichTextReadOnlyEditorWrapperProps = Omit<IRichTextReadOnlyEditor, "fileHandler" | "mentionHandler"> & {
  anchor: string;
  workspaceId: string;
};

export const RichTextReadOnlyEditor = React.forwardRef<EditorReadOnlyRefApi, RichTextReadOnlyEditorWrapperProps>(
  ({ anchor, workspaceId, ...props }, ref) => {
    const { mentionHighlights } = useMention();

    return (
      <RichTextReadOnlyEditorWithRef
        ref={ref}
        fileHandler={getReadOnlyEditorFileHandlers({
          anchor,
          workspaceId,
        })}
        mentionHandler={{ highlights: mentionHighlights }}
        {...props}
        // overriding the customClassName to add relative class passed
        containerClassName={cn("relative p-0 border-none", props.containerClassName)}
      />
    );
  }
);

RichTextReadOnlyEditor.displayName = "RichTextReadOnlyEditor";
