"use client";

import { observer } from "mobx-react";
import Image from "next/image";
// components
import { getButtonStyling } from "@plane/ui";
import { PageHead } from "@/components/core";
import IntegrationGuide from "@/components/integration/guide";
// constants
import { EUserWorkspaceRoles } from "@/constants/workspace";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useUser, useWorkspace, useInstance } from "@/hooks/store";

const ImportsPage = observer(() => {
  // store hooks
  const { instance } = useInstance();
  const {
    userProfile: { data: userProfile },
    membership: { currentWorkspaceRole },
  } = useUser();
  const { currentWorkspace } = useWorkspace();

  // derived values
  const isAdmin = currentWorkspaceRole === EUserWorkspaceRoles.ADMIN;
  const isDarkMode = userProfile?.theme.theme === "dark";
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Imports` : undefined;

  if (!isAdmin)
    return (
      <>
        <PageHead title={pageTitle} />
        <div className="mt-10 flex h-full w-full justify-center p-4">
          <p className="text-sm text-custom-text-300">You are not authorized to access this page.</p>
        </div>
      </>
    );

  if (instance?.product === "plane-one")
    return (
      <div className="flex h-full flex-col gap-10 rounded-xl px-8">
        <div className="flex items-center border-b border-custom-border-100 py-3.5">
          <h3 className="text-xl font-medium">Imports</h3>
        </div>
        <div
          className={cn("item-center flex min-h-[25rem] justify-between rounded-xl", {
            "bg-gradient-to-l from-[#343434] via-[#484848]  to-[#1E1E1E]": userProfile?.theme.theme === "dark",
            "bg-gradient-to-l from-[#3b5ec6] to-[#f5f7fe]": userProfile?.theme.theme === "light",
          })}
        >
          <div className="relative flex flex-col justify-center gap-7 pl-8 lg:w-1/2">
            <div className="flex max-w-96 flex-col gap-2">
              <h2 className="text-2xl font-semibold">Imports are coming soon!</h2>
              <p className="text-base font-medium text-custom-text-300">
                Get your issues, sprints, components, docs, and anything else with Plane One-only imports coming very
                soon.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                className={`${getButtonStyling("primary", "md")} cursor-pointer`}
                href="https://ece39166.sibforms.com/serve/MUIFAPPLJk02NaZT7ZOinKdoKPL351GVFpEmit1jpJixcLlqd3TaulIT9Czmu0yDy_5bqzuVmEu6Y6oUc09X2NIhI88jplFs0G6ARQa6NxHxACHAUtKNQhOmyI7zpC4MLV_E3kkwlwbzguZyKKURADedKgRarGu77LFz6f9CH-DUDntNbrooJhU1-vndV1EyWNrFgvjMDjz2wSat"
                target="_blank"
                rel="noreferrer"
              >
                Stay in loop
              </a>
            </div>
          </div>
          <div className="relative hidden w-1/2 lg:block">
            <span className="absolute bottom-0 right-0">
              <Image
                src={`/upcoming-features/imports-cta-1-${isDarkMode ? "dark" : "light"}.png`}
                height={420}
                width={420}
                alt="cta-1"
              />
            </span>
            <span className="absolute -bottom-16 right-1/2 rounded-xl">
              <Image
                src={`/upcoming-features/imports-cta-2-${isDarkMode ? "dark" : "light"}.png`}
                height={210}
                width={280}
                alt="cta-2"
              />
            </span>
          </div>
        </div>
      </div>
    );

  return (
    <>
      <PageHead title={pageTitle} />
      <section className="w-full overflow-y-auto py-8 pr-9">
        <div className="flex items-center border-b border-custom-border-100 py-3.5">
          <h3 className="text-xl font-medium">Imports</h3>
        </div>
        <IntegrationGuide />
      </section>
    </>
  );
});

export default ImportsPage;
