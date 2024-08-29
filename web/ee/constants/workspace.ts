// ce constants
import { WORKSPACE_SETTINGS as WORKSPACE_SETTINGS_CE } from "ce/constants/workspace";
import { Timer } from "lucide-react";
// components
import { SettingIcon } from "@/components/icons/attachment";
// constants
import { EUserWorkspaceRoles } from "@/constants/workspace";
// logos
import JiraLogo from "@/public/services/jira.svg";

export const WORKSPACE_SETTINGS = {
  ...WORKSPACE_SETTINGS_CE,
  integrations: {
    key: "integrations",
    label: "Integrations",
    href: `/settings/integrations`,
    access: EUserWorkspaceRoles.ADMIN,
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/settings/integrations/`,
    Icon: SettingIcon,
  },
  import: {
    key: "import",
    label: "Imports",
    href: `/settings/imports`,
    access: EUserWorkspaceRoles.ADMIN,
    highlight: (pathname: string, baseUrl: string) => pathname.includes(`${baseUrl}/settings/imports/`),
    Icon: SettingIcon,
  },
  worklogs: {
    key: "worklogs",
    label: "Worklogs",
    href: `/settings/worklogs`,
    access: EUserWorkspaceRoles.ADMIN,
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/settings/worklogs/`,
    Icon: Timer,
  },
  activation: {
    key: "activation",
    label: "Activation",
    href: `/settings/activation`,
    access: EUserWorkspaceRoles.ADMIN,
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/settings/activation/`,
    Icon: Timer,
  },
  project_states: {
    key: "project_states",
    label: "Project States",
    href: `/settings/project-states`,
    access: EUserWorkspaceRoles.ADMIN,
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/settings/project-states/`,
    Icon: Timer,
  },
};

export const WORKSPACE_SETTINGS_LINKS = [
  WORKSPACE_SETTINGS["general"],
  WORKSPACE_SETTINGS["members"],
  // WORKSPACE_SETTINGS["activation"], // FIXME: Temporary hide this tab
  WORKSPACE_SETTINGS["project_states"],
  WORKSPACE_SETTINGS["billing-and-plans"],
  WORKSPACE_SETTINGS["integrations"],
  WORKSPACE_SETTINGS["import"],
  WORKSPACE_SETTINGS["export"],
  WORKSPACE_SETTINGS["webhooks"],
  WORKSPACE_SETTINGS["api-tokens"],
  WORKSPACE_SETTINGS["worklogs"],
];

export const IMPORTERS_LIST = [
  {
    provider: "jira",
    type: "Import",
    title: "Jira",
    description: "Import your Jira data into Plane projects.",
    logo: JiraLogo,
  },
];
