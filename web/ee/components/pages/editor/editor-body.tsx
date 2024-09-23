import { useCallback, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// document-editor
import {
  CollaborativeDocumentEditorWithRef,
  CollaborativeDocumentReadOnlyEditorWithRef,
  EditorReadOnlyRefApi,
  EditorRefApi,
  IMarking,
  TAIMenuProps,
  TDisplayConfig,
  TRealtimeConfig,
  TServerHandler,
} from "@plane/editor";
// types
import { IUserLite } from "@plane/types";
// components
import { PageContentBrowser, PageEditorTitle, PageContentLoader } from "@/components/pages";
// helpers
import { cn, LIVE_URL } from "@/helpers/common.helper";
import { generateRandomColor } from "@/helpers/string.helper";
// hooks
import { useMember, useUser, useWorkspace } from "@/hooks/store";
import { usePageFilters } from "@/hooks/use-page-filters";
// plane web components
import { EditorAIMenu, IssueEmbedCard } from "@/plane-web/components/pages";
// plane web hooks
import { useEditorFlagging } from "@/plane-web/hooks/use-editor-flagging";
import { useWorkspaceIssueEmbed } from "@/plane-web/hooks/use-workspace-issue-embed";
import { useWorkspaceMention } from "@/plane-web/hooks/use-workspace-mention";
// store
import { IWorkspacePageDetails } from "@/plane-web/store/pages/page";
// services
import { FileService } from "@/services/file.service";

const fileService = new FileService();

type Props = {
  editorRef: React.RefObject<EditorRefApi>;
  handleConnectionStatus: (status: boolean) => void;
  handleEditorReady: (value: boolean) => void;
  handleReadOnlyEditorReady: (value: boolean) => void;
  markings: IMarking[];
  page: IWorkspacePageDetails;
  readOnlyEditorRef: React.RefObject<EditorReadOnlyRefApi>;
  sidePeekVisible: boolean;
  updateMarkings: (description_html: string) => void;
};

export const WorkspacePageEditorBody: React.FC<Props> = observer((props) => {
  const {
    editorRef,
    handleConnectionStatus,
    handleEditorReady,
    handleReadOnlyEditorReady,
    markings,
    page,
    readOnlyEditorRef,
    sidePeekVisible,
    updateMarkings,
  } = props;
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { data: currentUser } = useUser();
  const { getWorkspaceBySlug } = useWorkspace();
  const {
    getUserDetails,
    workspace: { workspaceMemberIds },
  } = useMember();
  // derived values
  const workspaceId = workspaceSlug ? (getWorkspaceBySlug(workspaceSlug.toString())?.id ?? "") : "";
  const pageId = page?.id;
  const pageTitle = page?.name ?? "";
  const pageDescription = page?.description_html;
  const { isContentEditable, updateTitle, setIsSubmitting } = page;
  const workspaceMemberDetails = workspaceMemberIds?.map((id) => getUserDetails(id) as IUserLite);
  // use-mention
  const { mentionHighlights, mentionSuggestions } = useWorkspaceMention({
    workspaceSlug: workspaceSlug.toString(),
    members: workspaceMemberDetails,
    user: currentUser ?? undefined,
  });
  // editor flaggings
  const { documentEditor } = useEditorFlagging(workspaceSlug?.toString());
  // page filters
  const { fontSize, fontStyle, isFullWidth } = usePageFilters();
  // issue-embed
  const { fetchIssues } = useWorkspaceIssueEmbed(workspaceSlug?.toString() ?? "");

  const displayConfig: TDisplayConfig = {
    fontSize,
    fontStyle,
  };

  const getAIMenu = useCallback(
    ({ isOpen, onClose }: TAIMenuProps) => <EditorAIMenu editorRef={editorRef} isOpen={isOpen} onClose={onClose} />,
    [editorRef]
  );

  const handleServerConnect = useCallback(() => {
    handleConnectionStatus(false);
  }, []);
  const handleServerError = useCallback(() => {
    handleConnectionStatus(true);
  }, []);

  const serverHandler: TServerHandler = useMemo(
    () => ({
      onConnect: handleServerConnect,
      onServerError: handleServerError,
    }),
    []
  );

  useEffect(() => {
    updateMarkings(pageDescription ?? "<p></p>");
  }, [pageDescription, updateMarkings]);

  const realtimeConfig: TRealtimeConfig = useMemo(
    () => ({
      url: `${LIVE_URL}/collaboration`,
      queryParams: {
        workspaceSlug: workspaceSlug?.toString(),
        documentType: "workspace_page",
      },
    }),
    [workspaceSlug]
  );

  const handleIssueSearch = async (searchQuery: string) => {
    const response = await fetchIssues(searchQuery);
    return response;
  };

  if (pageId === undefined) return <PageContentLoader />;

  if (pageDescription === undefined) return <PageContentLoader />;

  return (
    <div className="flex items-center h-full w-full overflow-y-auto">
      <div
        className={cn("sticky top-0 hidden h-full flex-shrink-0 -translate-x-full p-5 duration-200 md:block", {
          "translate-x-0": sidePeekVisible,
          "w-[10rem] lg:w-[14rem]": !isFullWidth,
          "w-[5%]": isFullWidth,
        })}
      >
        {!isFullWidth && (
          <PageContentBrowser
            editorRef={(isContentEditable ? editorRef : readOnlyEditorRef)?.current}
            markings={markings}
          />
        )}
      </div>
      <div
        className={cn("h-full w-full pt-5 duration-200", {
          "md:w-[calc(100%-10rem)] xl:w-[calc(100%-28rem)]": !isFullWidth,
          "md:w-[90%]": isFullWidth,
        })}
      >
        <div className="h-full w-full flex flex-col gap-y-7 overflow-y-auto overflow-x-hidden">
          <div className="relative w-full flex-shrink-0 md:pl-5 px-4">
            <PageEditorTitle
              editorRef={editorRef}
              title={pageTitle}
              updateTitle={updateTitle}
              readOnly={!isContentEditable}
            />
          </div>
          {isContentEditable ? (
            <CollaborativeDocumentEditorWithRef
              id={pageId}
              fileHandler={{
                cancel: fileService.cancelUpload,
                delete: fileService.getDeleteImageFunction(workspaceId),
                restore: fileService.getRestoreImageFunction(workspaceId),
                upload: fileService.getUploadFileFunction(workspaceSlug as string, setIsSubmitting),
              }}
              handleEditorReady={handleEditorReady}
              ref={editorRef}
              containerClassName="p-0 pb-64"
              displayConfig={displayConfig}
              editorClassName="pl-10"
              mentionHandler={{
                highlights: mentionHighlights,
                suggestions: mentionSuggestions,
              }}
              embedHandler={{
                issue: {
                  searchCallback: async (query) =>
                    new Promise((resolve) => {
                      setTimeout(async () => {
                        const response = await handleIssueSearch(query);
                        const issueItemsWithIdentifiers = response?.map((issue) => ({
                          ...issue,
                          projectId: issue.projectId,
                          workspaceSlug: workspaceSlug.toString(),
                        }));
                        resolve(issueItemsWithIdentifiers);
                      }, 300);
                    }),
                  widgetCallback: ({
                    issueId,
                    projectId: projectIdFromEmbed,
                    workspaceSlug: workspaceSlugFromEmbed,
                  }) => {
                    const resolvedProjectId = projectIdFromEmbed ?? "";
                    const resolvedWorkspaceSlug = workspaceSlugFromEmbed ?? workspaceSlug?.toString() ?? "";
                    return (
                      <IssueEmbedCard
                        issueId={issueId}
                        projectId={resolvedProjectId}
                        workspaceSlug={resolvedWorkspaceSlug}
                      />
                    );
                  },
                },
              }}
              realtimeConfig={realtimeConfig}
              serverHandler={serverHandler}
              user={{
                id: currentUser?.id ?? "",
                name: currentUser?.display_name ?? "",
                color: generateRandomColor(currentUser?.id ?? ""),
              }}
              disabledExtensions={documentEditor}
              aiHandler={{
                menu: getAIMenu,
              }}
            />
          ) : (
            <CollaborativeDocumentReadOnlyEditorWithRef
              id={pageId}
              ref={readOnlyEditorRef}
              handleEditorReady={handleReadOnlyEditorReady}
              containerClassName="p-0 pb-64 border-none"
              displayConfig={displayConfig}
              editorClassName="pl-10"
              mentionHandler={{
                highlights: mentionHighlights,
              }}
              embedHandler={{
                issue: {
                  widgetCallback: ({
                    issueId,
                    projectId: projectIdFromEmbed,
                    workspaceSlug: workspaceSlugFromEmbed,
                  }) => {
                    const resolvedProjectId = projectIdFromEmbed ?? "";
                    const resolvedWorkspaceSlug = workspaceSlugFromEmbed ?? workspaceSlug?.toString() ?? "";

                    return (
                      <IssueEmbedCard
                        issueId={issueId}
                        projectId={resolvedProjectId}
                        workspaceSlug={resolvedWorkspaceSlug}
                      />
                    );
                  },
                },
              }}
              realtimeConfig={realtimeConfig}
              serverHandler={serverHandler}
              user={{
                id: currentUser?.id ?? "",
                name: currentUser?.display_name ?? "",
                color: generateRandomColor(currentUser?.id ?? ""),
              }}
            />
          )}
        </div>
      </div>
      <div
        className={cn("hidden xl:block flex-shrink-0 duration-200", {
          "w-[10rem] lg:w-[14rem]": !isFullWidth,
          "w-[5%]": isFullWidth,
        })}
      />
    </div>
  );
});
