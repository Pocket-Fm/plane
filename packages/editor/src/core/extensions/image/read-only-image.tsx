import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
// extensions
import { CustomImageNode } from "@/extensions";
// types
import { TReadOnlyFileHandler } from "@/types";

export const ReadOnlyImageExtension = (props: TReadOnlyFileHandler) => {
  const { getAssetSrc } = props;

  return Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: "35%",
        },
        height: {
          default: null,
        },
      };
    },

    addCommands() {
      return {
        getImageSource: (path: string) => () => getAssetSrc(path),
      };
    },

    addNodeView() {
      return ReactNodeViewRenderer(CustomImageNode);
    },
  });
};
