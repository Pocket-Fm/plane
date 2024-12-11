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
};

export const FORMAT_CONFIG = {
  thumbnail: {
    label: "Thumbnail",
    tasks: ["Design Thumbnail Mockups", "Finalize Thumbnail Dimensions", "Review Thumbnail with Stakeholders"],
  },
  genai: {
    label: "Gen AI",
    tasks: ["Generate Initial AI Concepts", "Refine AI-Generated Visuals", "Validate AI Output for Accuracy"],
  },
  live_action: {
    label: "Live Action",
    tasks: ["Plan Live Action Script", "Organize Filming Schedule", "Edit Live Action Footage"],
  },
  animation: {
    label: "Animation",
    tasks: ["Create Animation Storyboard", "Design Animation Assets", "Review Animation Workflow"],
  },
  sketch: {
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
  const defaultIssues = ideationRequired
    ? [{ name: `${moduleName} | Ideation Task` }, { name: `${moduleName} | Writers Task` }]
    : [{ name: `${moduleName} | Writers Task` }];
  const issuePromises = defaultIssues.map((issue) => {
    const payload: Partial<TIssue> = {
      ...BASE_ISSUE_PAYLOAD,
      project_id: projectId,
      module_ids: [moduleId],
      name: issue.name,
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
  format="thumbnail",
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
