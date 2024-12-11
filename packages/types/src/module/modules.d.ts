import type { TIssue, IIssueFilterOptions, ILinkDetails } from "@plane/types";

export type TModuleStatus =
  | "backlog"
  | "planned"
  | "in-progress"
  | "paused"
  | "completed"
  | "cancelled";

export type TModuleCompletionChartDistribution = {
  [key: string]: number | null;
};

export type TModuleDistributionBase = {
  total_issues: number;
  pending_issues: number;
  completed_issues: number;
};

export type TModuleEstimateDistributionBase = {
  total_estimates: number;
  pending_estimates: number;
  completed_estimates: number;
};

export type TModuleAssigneesDistribution = {
  assignee_id: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
};

export type TModuleLabelsDistribution = {
  color: string | null;
  label_id: string | null;
  label_name: string | null;
};

export type TModuleDistribution = {
  assignees: (TModuleAssigneesDistribution & TModuleDistributionBase)[];
  completion_chart: TModuleCompletionChartDistribution;
  labels: (TModuleLabelsDistribution & TModuleDistributionBase)[];
};

export type TModuleEstimateDistribution = {
  assignees: (TModuleAssigneesDistribution & TModuleEstimateDistributionBase)[];
  completion_chart: TModuleCompletionChartDistribution;
  labels: (TModuleLabelsDistribution & TModuleEstimateDistributionBase)[];
};

export interface IModule {
  total_issues: number;
  completed_issues: number;
  backlog_issues: number;
  started_issues: number;
  unstarted_issues: number;
  cancelled_issues: number;
  total_estimate_points?: number;
  completed_estimate_points?: number;
  backlog_estimate_points: number;
  started_estimate_points: number;
  unstarted_estimate_points: number;
  cancelled_estimate_points: number;
  distribution?: TModuleDistribution;
  estimate_distribution?: TModuleEstimateDistribution;

  id: string;
  name: string;
  description: string;
  description_text: any;
  description_html: any;
  workspace_id: string;
  project_id: string;
  lead_id: string | null;
  member_ids: string[];
  link_module?: ILinkDetails[];
  sub_issues?: number;
  is_favorite: boolean;
  sort_order: number;
  view_props: {
    filters: IIssueFilterOptions;
  };
  status?: TModuleStatus;
  archived_at: string | null;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // promo attrs (Since Module IS A _Promo_)
  show_id: string;
  original_show_id: string;
  team: string;
  format: string;
  parent_id: string;
  voa_ids: string[];
  ideation_required?: boolean;
  writer_ids: string[];
  se_ids: string[];
  sketch_artist_ids: string[];
  creative_lead_id: string;
  freeze_workflow: boolean;
}

export interface ModuleIssueResponse {
  created_at: Date;
  created_by: string;
  id: string;
  issue: string;
  issue_detail: TIssue;
  module: string;
  module_detail: IModule;
  project: string;
  updated_at: Date;
  updated_by: string;
  workspace: string;
  sub_issues_count: number;
}

export type ModuleLink = {
  title: string;
  url: string;
};

export type SelectModuleType =
  | (IModule & { actionType: "edit" | "delete" | "create-issue" })
  | undefined;

export type TModulePlotType = "burndown" | "points";
