import { EPromoIssueType, PROMO_ISSUE_TYPE_NAME_SUFFIXES } from "@/constants/issue";
import { TIssue } from "@plane/types";

const BASE_ISSUE_PAYLOAD: Partial<TIssue> = {
  type_id: null,
  estimate_point: null,
  state_id: "",
  parent_id: null,
  priority: "none",
  target_date: null,
  label_ids: [],
  assignee_ids: [],
  sub_issues_count: 0,
  props: {},
};

export const FORMAT_CONFIG = {
  Thumbnail: {
    label: "Thumbnail",
    tasks: ["Design Thumbnail Mockups", "Finalize Thumbnail Dimensions", "Review Thumbnail with Stakeholders"],
  },
  "Gen AI": {
    label: "Gen AI",
    tasks: ["Generate Initial AI Concepts", "Refine AI-Generated Visuals", "Validate AI Output for Accuracy"],
  },
  "Live Action": {
    label: "Live Action",
    tasks: ["Plan Live Action Script", "Organize Filming Schedule", "Edit Live Action Footage"],
  },
  Animation: {
    label: "Animation",
    tasks: ["Create Animation Storyboard", "Design Animation Assets", "Review Animation Workflow"],
  },
  Sketch: {
    label: "Sketch",
    tasks: ["Draft Initial Sketches", "Digitize Sketch Concepts", "Finalize Sketch for Approval"],
  },
} as const;

type CreateDefaultIssuesProps = {
  userId: string;
  workspaceSlug: string;
  projectId: string;
  moduleId: string;
  moduleName: string;
  createIssue: (workspaceSlug: string, projectId: string, payload: Partial<TIssue>, moduleId: string) => Promise<any>;
  ideationRequired: boolean;
};

export const createDefaultModuleIssues = async ({
  workspaceSlug,
  projectId,
  moduleId,
  moduleName,
  createIssue,
  userId,
  ideationRequired,
}: CreateDefaultIssuesProps) => {
  const defaultIssueTypes: EPromoIssueType[] = [EPromoIssueType.SCRIPT_WRITING];
  if (ideationRequired)
    defaultIssueTypes.unshift(EPromoIssueType.IDEATION);

  const issuePromises = defaultIssueTypes.map((issueType) => {
    const payload: Partial<TIssue> = {
      ...BASE_ISSUE_PAYLOAD,
      project_id: projectId,
      module_ids: [moduleId],
      name: `${moduleName} | ${PROMO_ISSUE_TYPE_NAME_SUFFIXES[issueType]}`,
      assignee_ids: [userId],
    };
    return createIssue(workspaceSlug, projectId, payload, moduleId);
  });

  return Promise.all(issuePromises);
};

type CreateFormatIssuesProps = Omit<CreateDefaultIssuesProps, "ideationRequired" | "userId"> & {
  format: keyof typeof FORMAT_CONFIG;
};

export const createFormatModuleIssues = async ({
  workspaceSlug,
  projectId,
  moduleId,
  moduleName,
  createIssue,
  format="Thumbnail",
}: CreateFormatIssuesProps) => {
  const formatTasks = FORMAT_CONFIG[format].tasks;
  const issuePromises = formatTasks.map((taskName) => {
    const payload: Partial<TIssue> = {
      ...BASE_ISSUE_PAYLOAD,
      project_id: projectId,
      module_ids: [moduleId],
      name: `${moduleName} | ${taskName}`,
    };
    return createIssue(workspaceSlug, projectId, payload, moduleId);
  });

  return Promise.all(issuePromises);
};

export const getFormatDropdownOptions = () =>
  Object.entries(FORMAT_CONFIG).map(([key, config]) => ({
    value: config.label,
    data: key,
  }));
