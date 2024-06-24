"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { TInstanceConfigurationKeys } from "@plane/types";
import { Loader, ToggleSwitch, setPromiseToast } from "@plane/ui";
// components
import { PageHeader } from "@/components/common";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useInstance } from "@/hooks/store";
// plane admin components
import { AuthenticationModes } from "@/plane-admin/components/authentication";

const InstanceAuthenticationPage = observer(() => {
  // store
  const { fetchInstanceConfigurations, formattedConfig, updateInstanceConfigurations } = useInstance();

  useSWR("INSTANCE_CONFIGURATIONS", () => fetchInstanceConfigurations());

  // state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // derived values
  const enableSignUpConfig = formattedConfig?.ENABLE_SIGNUP ?? "";

  const updateConfig = async (key: TInstanceConfigurationKeys, value: string) => {
    setIsSubmitting(true);

    const payload = {
      [key]: value,
    };

    const updateConfigPromise = updateInstanceConfigurations(payload);

    setPromiseToast(updateConfigPromise, {
      loading: "Saving Configuration...",
      success: {
        title: "Success",
        message: () => "Configuration saved successfully",
      },
      error: {
        title: "Error",
        message: () => "Failed to save configuration",
      },
    });

    await updateConfigPromise
      .then(() => {
        setIsSubmitting(false);
      })
      .catch((err) => {
        console.error(err);
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <PageHeader title="Authentication - God Mode" />
      <div className="relative container mx-auto w-full h-full p-4 py-4 space-y-6 flex flex-col">
        <div className="border-b border-custom-border-100 mx-4 py-4 space-y-1 flex-shrink-0">
          <div className="text-xl font-medium text-custom-text-100">Manage authentication for your instance</div>
          <div className="text-sm font-normal text-custom-text-300">
            Configure authentication modes for your team and restrict sign ups to be invite only.
          </div>
        </div>
        <div className="flex-grow overflow-hidden overflow-y-scroll vertical-scrollbar scrollbar-md px-4">
          {formattedConfig ? (
            <div className="space-y-3">
              <div className="text-lg font-medium pb-1">Sign-up configuration</div>
              <div className={cn("w-full flex items-center gap-14 rounded")}>
                <div className="flex grow items-center gap-4">
                  <div className="grow">
                    <div className={cn("font-medium leading-5 text-custom-text-100 text-sm")}>
                      Allow anyone to sign up without invite
                    </div>
                    <div className={cn("font-normal leading-5 text-custom-text-300 text-xs")}>
                      Toggling this off will disable self sign ups.
                    </div>
                  </div>
                </div>
                <div className={`shrink-0 pr-4 ${isSubmitting && "opacity-70"}`}>
                  <div className="flex items-center gap-4">
                    <ToggleSwitch
                      value={Boolean(parseInt(enableSignUpConfig))}
                      onChange={() => {
                        Boolean(parseInt(enableSignUpConfig)) === true
                          ? updateConfig("ENABLE_SIGNUP", "0")
                          : updateConfig("ENABLE_SIGNUP", "1");
                      }}
                      size="sm"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
              <div className="text-lg font-medium pt-6">Authentication modes</div>
              <AuthenticationModes disabled={isSubmitting} updateConfig={updateConfig} />
            </div>
          ) : (
            <Loader className="space-y-10">
              <Loader.Item height="50px" width="75%" />
              <Loader.Item height="50px" width="75%" />
              <Loader.Item height="50px" width="40%" />
              <Loader.Item height="50px" width="40%" />
              <Loader.Item height="50px" width="20%" />
            </Loader>
          )}
        </div>
      </div>
    </>
  );
});

export default InstanceAuthenticationPage;
