"use client"

import { EPromoIssueType, PROMO_ISSUE_EXTENDED_PROPERTIES } from "@/constants/issue";
import { TIssue } from "@plane/types"
import { Input } from "@plane/ui"
import { ScrollTextIcon } from "lucide-react";

export const ExtendedIssueProperties = (props: { issueProps: TIssue['props'], promoIssueType: EPromoIssueType, onPropsChange: (props: any) => void }) => {
    const { issueProps, promoIssueType, onPropsChange } = props;
    if (promoIssueType === EPromoIssueType.UNDEFINED) return null;
    return (
        <div className="flex flex-col gap-3 border border-custom-border-200 rounded p-3">
            {
                PROMO_ISSUE_EXTENDED_PROPERTIES[promoIssueType].map((prop) =>
                    <div className="flex w-full items-center gap-3 h-8">
                        <div className="flex items-center gap-1 w-1/4 flex-shrink-0 text-sm text-custom-text-300">
                            <ScrollTextIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{prop.title}</span>
                        </div>
                        <Input
                            id={prop.key}
                            name={prop.key}
                            type={prop.type}
                            value={issueProps?.[prop.key]}
                            onChange={(e) => { onPropsChange({...issueProps,[prop.key]: e.target.value})}}
                            placeholder={prop.title}
                            className="w-full text-base"
                            autoFocus
                        />
                    </div>
                )
            }
        </div>
    )
}