"use client";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
// ui
import { Loader, setToast, TOAST_TYPE } from "@plane/ui";
// ce components
import {
  IssueAdditionalPropertyValuesUpdate as CEIssueAdditionalPropertyValuesUpdate,
  TIssueAdditionalPropertyValuesUpdateProps,
} from "@/ce/components/issue-types";
// plane web components
import { IssueAdditionalPropertyValues } from "@/plane-web/components/issue-types";
// plane web hooks
import { useIssuePropertiesActivity, useIssueType, useIssueTypes } from "@/plane-web/hooks/store";
// plane web services
import { IssuePropertyValuesService } from "@/plane-web/services/issue-types";
// plane web types
import { TIssuePropertyValues } from "@/plane-web/types";

const issuePropertyValuesService = new IssuePropertyValuesService();

export const IssueAdditionalPropertyValuesUpdate: React.FC<TIssueAdditionalPropertyValuesUpdateProps> = observer(
  (props) => {
    const { issueId, issueTypeId, projectId, workspaceSlug, isDisabled } = props;
    // states
    const [issuePropertyValues, setIssuePropertyValues] = React.useState<TIssuePropertyValues>({});
    // store hooks
    const { isIssueTypeEnabledForProject, getProjectIssuePropertiesLoader, fetchAllPropertiesAndOptions } =
      useIssueTypes();
    const issueType = useIssueType(issueTypeId);
    const { fetchPropertyActivities } = useIssuePropertiesActivity();
    // derived values
    const isIssueTypeDisplayEnabled = isIssueTypeEnabledForProject(
      workspaceSlug?.toString(),
      projectId,
      "ISSUE_TYPE_DISPLAY"
    );
    const issueTypeDetails = issueType?.asJSON;
    const activeProperties = issueType?.activeProperties;
    const issuePropertiesLoader = getProjectIssuePropertiesLoader(projectId);
    // fetch methods
    async function fetchIssuePropertyValues() {
      // This is required when accessing the peek overview from workspace level.
      await fetchAllPropertiesAndOptions(workspaceSlug, projectId);
      return issuePropertyValuesService.fetchAll(workspaceSlug, projectId, issueId);
    }
    // fetch issue property values
    const { data, isLoading } = useSWR(
      workspaceSlug && projectId && issueId && isIssueTypeDisplayEnabled
        ? `ISSUE_PROPERTY_VALUES_${workspaceSlug}_${projectId}_${issueId}_${isIssueTypeDisplayEnabled}`
        : null,
      () => (workspaceSlug && projectId && issueId && isIssueTypeDisplayEnabled ? fetchIssuePropertyValues() : null),
      {
        revalidateOnFocus: false,
      }
    );

    useEffect(() => {
      if (data) setIssuePropertyValues(data);
    }, [data]);

    const handlePropertyValueChange = async (propertyId: string, value: string[]) => {
      const beforeUpdateValue = issuePropertyValues[propertyId];
      setIssuePropertyValues((prev) => ({
        ...prev,
        [propertyId]: value,
      }));
      // update the property value
      await issuePropertyValuesService
        .update(workspaceSlug, projectId, issueId, propertyId, value)
        .then(async () => await fetchPropertyActivities(workspaceSlug, projectId, issueId))
        .catch((error) => {
          // revert the value if update fails
          setIssuePropertyValues((prev) => ({
            ...prev,
            [propertyId]: beforeUpdateValue,
          }));
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: error?.error ?? "Property could not be update. Please try again.",
          });
        });
    };

    // if issue types are not enabled, return null
    if (!isIssueTypeDisplayEnabled) return <CEIssueAdditionalPropertyValuesUpdate {...props} />;

    if (issuePropertiesLoader === "init-loader") {
      return (
        <Loader className="space-y-4 py-4">
          <Loader.Item height="30px" />
          <Loader.Item height="30px" />
          <Loader.Item height="30px" />
          <Loader.Item height="30px" />
        </Loader>
      );
    }

    // if issue type details or active properties are not available, return null
    if (!issueTypeDetails || !activeProperties?.length) return null;

    return (
      <IssueAdditionalPropertyValues
        issueTypeId={issueTypeId}
        projectId={projectId}
        issuePropertyValues={issuePropertyValues}
        variant="update"
        isPropertyValuesLoading={isLoading}
        handlePropertyValueChange={handlePropertyValueChange}
        isDisabled={isDisabled}
      />
    );
  }
);
