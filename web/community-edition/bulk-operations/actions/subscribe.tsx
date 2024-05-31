import { useState } from "react";
import { observer } from "mobx-react";
import { BellDot, Crown } from "lucide-react";
// community-edition
import { BulkOperationsUpgradeToProModal } from "@plane/bulk-operations";
// ui
import { Tooltip } from "@plane/ui";
// constants
import { MARKETING_PRICING_PAGE_LINK } from "@/constants/common";

export const BulkSubscribeIssues: React.FC = observer(() => {
  // states
  const [isUpgradeToProModalOpen, setIsUpgradeToProModalOpen] = useState(false);

  return (
    <>
      <BulkOperationsUpgradeToProModal
        isOpen={isUpgradeToProModalOpen}
        onClose={() => setIsUpgradeToProModalOpen(false)}
      />
      <Tooltip tooltipHeading="Subscribe" tooltipContent="">
        <a
          href={MARKETING_PRICING_PAGE_LINK}
          className="relative outline-none grid place-items-center"
          onClick={(e) => {
            if (window.innerWidth >= 768) {
              e.preventDefault();
              e.stopPropagation();
              setIsUpgradeToProModalOpen(true);
            }
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <BellDot className="size-4" />
          <span className="absolute -top-3 -right-2 size-[18px] bg-custom-background-100 rounded-full grid place-items-center">
            <span className="size-[18px] bg-yellow-500/10 rounded-full grid place-items-center">
              <Crown className="size-3 text-yellow-500" />
            </span>
          </span>
        </a>
      </Tooltip>
    </>
  );
});
