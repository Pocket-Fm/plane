"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { IModule } from "@plane/types";
// ui
import { Button, Dropdown, Input, TextArea } from "@plane/ui";
// components
import { DateRangeDropdown, ProjectDropdown, MemberDropdown } from "@/components/dropdowns";
import { ModuleStatusSelect } from "@/components/modules";
// constants
import { ETabIndices } from "@/constants/tab-indices";
// helpers
import { getDate, renderFormattedPayloadDate } from "@/helpers/date-time.helper";
import { shouldRenderProject } from "@/helpers/project.helper";
import { getTabIndex } from "@/helpers/tab-indices.helper";
import { ChevronDownIcon } from "lucide-react";
// types

type Props = {
  handleFormSubmit: (values: Partial<IModule>, dirtyFields: any) => Promise<void>;
  handleClose: () => void;
  status: boolean;
  projectId: string;
  setActiveProject: React.Dispatch<React.SetStateAction<string | null>>;
  data?: IModule;
  isMobile?: boolean;
};

const defaultValues: Partial<IModule> = {
  name: "",
  description: "",
  status: "backlog",
  lead_id: null,
  member_ids: [],
};

export const ModuleForm: React.FC<Props> = (props) => {
  const { handleFormSubmit, handleClose, status, projectId, setActiveProject, data, isMobile = false } = props;
  // form info
  const {
    formState: { errors, isSubmitting, dirtyFields },
    handleSubmit,
    control,
    reset,
  } = useForm<IModule>({
    defaultValues: {
      project_id: projectId,
      name: data?.name || "",
      description: data?.description || "",
      status: data?.status || "backlog",
      lead_id: data?.lead_id || null,
      member_ids: data?.member_ids || [],
    },
  });

  const { getIndex } = getTabIndex(ETabIndices.PROJECT_MODULE, isMobile);

  const handleCreateUpdateModule = async (formData: Partial<IModule>) => {
    await handleFormSubmit(formData, dirtyFields);

    reset({
      ...defaultValues,
    });
  };

  useEffect(() => {
    reset({
      ...defaultValues,
      ...data,
    });
  }, [data, reset]);

  return (
    <form onSubmit={handleSubmit(handleCreateUpdateModule)}>
      <div className="space-y-5 p-5">
        <div className="flex items-center gap-x-3">
          {!status && (
            <Controller
              control={control}
              name="project_id"
              render={({ field: { value, onChange } }) => (
                <div className="h-7">
                  <ProjectDropdown
                    value={value}
                    onChange={(val) => {
                      onChange(val);
                      setActiveProject(val);
                    }}
                    buttonVariant="border-with-text"
                    renderCondition={(project) => shouldRenderProject(project)}
                    tabIndex={getIndex("cover_image")}
                  />
                </div>
              )}
            />
          )}
          <h3 className="text-xl font-medium text-custom-text-200">{status ? "Update" : "Create"} promo</h3>
            <Controller
              control={control}
              name="format"
              render={({ field: { value, onChange } }) => (
                <div className="h-7">
                  <Dropdown
                    value={value}
                    options={[
                      { data: "Thumbnail", value: "thumbnail" },
                      { data: "Gen AI", value: "genai" },
                      { data: "Live Action", value: "live_action" },
                      { data: "Animation", value: "animation" },
                      { data: "Sketch", value: "sketch" },
                    ]}
                    buttonContent={(isOpen, value)=>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{value?value:"Select Format"}</span>
                          <ChevronDownIcon className={`h-4 w-4 ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                    }
                    buttonContainerClassName="border-[0.5px] px-2 rounded border-custom-border-300"
                    keyExtractor={(item) => item.value}
                    onChange={onChange}
                    tabIndex={getIndex("format")}
                    disableSearch
                  />
                </div>
              )}
            />
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Controller
              control={control}
              name="name"
              rules={{
                required: "Title is required",
                maxLength: {
                  value: 255,
                  message: "Title should be less than 255 characters",
                },
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={value}
                  onChange={onChange}
                  hasError={Boolean(errors?.name)}
                  placeholder="Title"
                  className="w-full text-base"
                  tabIndex={getIndex("name")}
                  autoFocus
                />
              )}
            />
            <span className="text-xs text-red-500">{errors?.name?.message}</span>
          </div>
          <div>
            <Controller
              name="description"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextArea
                  id="description"
                  name="description"
                  value={value}
                  onChange={onChange}
                  placeholder="Description"
                  className="w-full text-base resize-none min-h-24"
                  hasError={Boolean(errors?.description)}
                  tabIndex={getIndex("description")}
                />
              )}
            />
          </div>
          <div className="inline-flex">
            <Controller
              control={control}
              name="show_id"
              rules={{
                required: "Show ID is required",
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  id="show_id"
                  name="show_id"
                  type="text"
                  value={value}
                  onChange={onChange}
                  hasError={Boolean(errors?.name)}
                  placeholder="Show ID"
                  className="w-1/2 text-base"
                  tabIndex={getIndex("show_id")}
                  autoFocus
                />
              )}
            />
            <span className="text-xs text-red-500">{errors?.name?.message}</span>
            <Controller
              control={control}
              name="original_show_id"
              render={({ field: { value, onChange } }) => (
                <Input
                  id="original_show_id"
                  name="original_show_id"
                  type="text"
                  value={value}
                  onChange={onChange}
                  hasError={Boolean(errors?.name)}
                  placeholder="Original Show ID"
                  className="w-1/2 text-base"
                  tabIndex={getIndex("original_show_id")}
                  autoFocus
                />
              )}
            />
            <span className="text-xs text-red-500">{errors?.name?.message}</span>
          </div>

          <div>
            <Controller
              control={control}
              name="opening_line"
              render={({ field: { value, onChange } }) => (
                <Input
                  id="opening_line"
                  name="opening_line"
                  type="text"
                  value={value}
                  onChange={onChange}
                  hasError={Boolean(errors?.name)}
                  placeholder="Opening line"
                  className="w-full text-base"
                  tabIndex={getIndex("opening_line")}
                  autoFocus
                />
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Controller
              control={control}
              name="start_date"
              render={({ field: { value: startDateValue, onChange: onChangeStartDate } }) => (
                <Controller
                  control={control}
                  name="target_date"
                  render={({ field: { value: endDateValue, onChange: onChangeEndDate } }) => (
                    <DateRangeDropdown
                      buttonVariant="border-with-text"
                      className="h-7"
                      value={{
                        from: getDate(startDateValue),
                        to: getDate(endDateValue),
                      }}
                      onSelect={(val) => {
                        onChangeStartDate(val?.from ? renderFormattedPayloadDate(val.from) : null);
                        onChangeEndDate(val?.to ? renderFormattedPayloadDate(val.to) : null);
                      }}
                      placeholder={{
                        from: "Start date",
                        to: "End date",
                      }}
                      hideIcon={{
                        to: true,
                      }}
                      tabIndex={getIndex("date_range")}
                    />
                  )}
                />
              )}
            />
            <div className="h-7">
              <ModuleStatusSelect control={control} error={errors.status} tabIndex={getIndex("status")} />
            </div>
            <Controller
              control={control}
              name="lead_id"
              render={({ field: { value, onChange } }) => (
                <div className="h-7">
                  <MemberDropdown
                    value={value}
                    onChange={onChange}
                    projectId={projectId}
                    multiple={false}
                    buttonVariant="border-with-text"
                    placeholder="Lead"
                    tabIndex={getIndex("lead")}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="member_ids"
              render={({ field: { value, onChange } }) => (
                <div className="h-7">
                  <MemberDropdown
                    value={value}
                    onChange={onChange}
                    projectId={projectId}
                    multiple
                    buttonVariant={value && value.length > 0 ? "transparent-without-text" : "border-with-text"}
                    buttonClassName={value && value.length > 0 ? "hover:bg-transparent px-0" : ""}
                    placeholder="Members"
                    tabIndex={getIndex("member_ids")}
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>
      <div className="px-5 py-4 flex items-center justify-end gap-2 border-t-[0.5px] border-custom-border-200">
        <Button variant="neutral-primary" size="sm" onClick={handleClose} tabIndex={getIndex("cancel")}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" loading={isSubmitting} tabIndex={getIndex("submit")}>
          {status ? (isSubmitting ? "Updating" : "Update Module") : isSubmitting ? "Creating" : "Create Promo"}
        </Button>
        {/* upon creating a promo here, create N issues */}
      </div>
    </form>
  );
};
