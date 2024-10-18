// plane editor
import { TFileHandler, TReadOnlyFileHandler } from "@plane/editor";
// constants
import { MAX_FILE_SIZE } from "@/constants/common";
// helpers
import { getFileURL } from "@/helpers/file.helper";
import { checkURLValidity } from "@/helpers/string.helper";
// services
import { FileService } from "@/services/file.service";
const fileService = new FileService();

/**
 * @description generate the file source using assetId
 * @param {string} anchor
 */
export const getEditorAssetSrc = (anchor: string, assetId: string): string | undefined => {
  const url = getFileURL(`/api/public/assets/v2/anchor/${anchor}/${assetId}/`);
  return url;
};

type TArgs = {
  anchor: string;
  uploadFile: (file: File) => Promise<string>;
  workspaceId: string;
};

/**
 * @description this function returns the file handler required by the read-only editors
 */
export const getReadOnlyEditorFileHandlers = (args: Pick<TArgs, "anchor" | "workspaceId">): TReadOnlyFileHandler => {
  const { anchor, workspaceId } = args;

  return {
    getAssetSrc: (path) => {
      if (!path) return "";
      if (checkURLValidity(path)) {
        return path;
      } else {
        return getEditorAssetSrc(anchor, path) ?? "";
      }
    },
    restore: async (src: string) => {
      if (checkURLValidity(src)) {
        await fileService.restoreOldEditorAsset(workspaceId, src);
      } else {
        await fileService.restoreNewAsset(anchor, src);
      }
    },
  };
};

/**
 * @description this function returns the file handler required by the editors
 * @param {TArgs} args
 */
export const getEditorFileHandlers = (args: TArgs): TFileHandler => {
  const { anchor, uploadFile, workspaceId } = args;

  return {
    ...getReadOnlyEditorFileHandlers({
      anchor,
      workspaceId,
    }),
    upload: uploadFile,
    delete: async (src: string) => {
      if (checkURLValidity(src)) {
        await fileService.deleteOldEditorAsset(workspaceId, src);
      } else {
        await fileService.deleteNewAsset(getEditorAssetSrc(anchor, src) ?? "");
      }
    },
    cancel: fileService.cancelUpload,
    validation: {
      maxFileSize: MAX_FILE_SIZE,
    },
  };
};
