import { FC, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
// types
import { IFormattedInstanceConfiguration, TInstanceSAMLAuthenticationConfigurationKeys } from "@plane/types";
// ui
import { Button, TOAST_TYPE, TextArea, getButtonStyling, setToast } from "@plane/ui";
// components
import {
  ConfirmDiscardModal,
  ControllerInput,
  TControllerInputFormField,
  CopyField,
  TCopyField,
} from "@/components/common";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useInstance } from "@/hooks/store";

type Props = {
  config: IFormattedInstanceConfiguration;
};

type SAMLConfigFormValues = Record<TInstanceSAMLAuthenticationConfigurationKeys, string>;

export const InstanceSAMLConfigForm: FC<Props> = (props) => {
  const { config } = props;
  // states
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false);
  // store hooks
  const { updateInstanceConfigurations } = useInstance();
  // form data
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SAMLConfigFormValues>({
    defaultValues: {
      SAML_ENTITY_ID: config["SAML_ENTITY_ID"],
      SAML_SSO_URL: config["SAML_SSO_URL"],
      SAML_LOGOUT_URL: config["SAML_LOGOUT_URL"],
      SAML_CERTIFICATE: config["SAML_CERTIFICATE"],
      SAML_PROVIDER_NAME: config["SAML_PROVIDER_NAME"],
    },
  });

  const originURL = typeof window !== "undefined" ? window.location.origin : "";

  const SAML_FORM_FIELDS: TControllerInputFormField[] = [
    {
      key: "SAML_ENTITY_ID",
      type: "text",
      label: "Entity ID",
      description: "A unique ID for this Plane app that you register on your IdP",
      placeholder: "70a44354520df8bd9bcd",
      error: Boolean(errors.SAML_ENTITY_ID),
      required: true,
    },
    {
      key: "SAML_SSO_URL",
      type: "text",
      label: "SSO URL",
      description: "The URL that brings up your IdP's authentication screen when your users click `Sign in with <name of IdP>`",
      placeholder: "https://example.com/sso",
      error: Boolean(errors.SAML_SSO_URL),
      required: true,
    },
    {
      key: "SAML_LOGOUT_URL",
      type: "text",
      label: "Logout URL",
      description: "Optional field that tells your IdP your users have logged out of this Plane app",
      placeholder: "https://example.com/logout",
      error: Boolean(errors.SAML_LOGOUT_URL),
      required: false,
    },
    {
      key: "SAML_PROVIDER_NAME",
      type: "text",
      label: "IdP's name",
      description: "Optional field for the name that your users see on the `Sign in with` button",
      placeholder: "Okta",
      error: Boolean(errors.SAML_PROVIDER_NAME),
      required: false,
    },
  ];

  const SAML_SERVICE_DETAILS: TCopyField[] = [
    {
      key: "Metadata_Information",
      label: "Entity ID | Audience | Metadata information",
      url: `${originURL}/auth/saml/metadata/`,
      description:
        "We will generate this bit of the metadata that identifies this Plane app as an authorized service on your IdP.",
    },
    {
      key: "Callback_URI",
      label: "Callback URI",
      url: `${originURL}/auth/saml/callback/`,
      description:
        "We will generate this `http-post request` URL that you should paste into your `ACS URL` or `Sign-in call back URL` field on your IdP.",
    },
    {
      key: "Logout_URI",
      label: "Logout URI",
      url: `${originURL}/auth/saml/logout/`,
      description: "We will generate this `http-redirect request` URL that you should paste into your `SLS URL` or `Logout URL` field on your IdP.",
    },
  ];

  const onSubmit = async (formData: SAMLConfigFormValues) => {
    const payload: Partial<SAMLConfigFormValues> = { ...formData };

    await updateInstanceConfigurations(payload)
      .then((response = []) => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Done!",
          message: "Your SAML-based authentication is configured. You should test it now.",
        });
        reset({
          SAML_ENTITY_ID: response.find((item) => item.key === "SAML_ENTITY_ID")?.value,
          SAML_SSO_URL: response.find((item) => item.key === "SAML_SSO_URL")?.value,
          SAML_LOGOUT_URL: response.find((item) => item.key === "SAML_LOGOUT_URL")?.value,
          SAML_CERTIFICATE: response.find((item) => item.key === "SAML_CERTIFICATE")?.value,
          SAML_PROVIDER_NAME: response.find((item) => item.key === "SAML_PROVIDER_NAME")?.value,
        });
      })
      .catch((err) => console.error(err));
  };

  const handleGoBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isDirty) {
      e.preventDefault();
      setIsDiscardChangesModalOpen(true);
    }
  };

  return (
    <>
      <ConfirmDiscardModal
        isOpen={isDiscardChangesModalOpen}
        onDiscardHref="/authentication"
        handleClose={() => setIsDiscardChangesModalOpen(false)}
      />
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
          <div className="flex flex-col gap-y-4 col-span-2 md:col-span-1">
            <div className="pt-2 text-xl font-medium">IdP-provided details for Plane</div>
            {SAML_FORM_FIELDS.map((field) => (
              <ControllerInput
                key={field.key}
                control={control}
                type={field.type}
                name={field.key}
                label={field.label}
                description={field.description}
                placeholder={field.placeholder}
                error={field.error}
                required={field.required}
              />
            ))}
            <div className="flex flex-col gap-1">
              <h4 className="text-sm">SAML certificate</h4>
              <Controller
                control={control}
                name="SAML_CERTIFICATE"
                rules={{ required: "Certificate is required." }}
                render={({ field: { value, onChange } }) => (
                  <TextArea
                    id="SAML_CERTIFICATE"
                    name="SAML_CERTIFICATE"
                    value={value}
                    onChange={onChange}
                    hasError={Boolean(errors.SAML_CERTIFICATE)}
                    placeholder="---BEGIN CERTIFICATE---\n2yWn1gc7DhOFB9\nr0gbE+\n---END CERTIFICATE---"
                    className="min-h-[102px] w-full rounded-md font-medium text-sm"
                  />
                )}
              />
              <p className="text-xs text-custom-text-400">
                IdP-generated certificate for signing this Plane app as an authorized service provider for your IdP
              </p>
            </div>
            <div className="flex flex-col gap-1 pt-4">
              <div className="flex items-center gap-4">
                <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={!isDirty}>
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
                <Link
                  href="/authentication"
                  className={cn(getButtonStyling("link-neutral", "md"), "font-medium")}
                  onClick={handleGoBack}
                >
                  Go back
                </Link>
              </div>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col gap-y-4 px-6 py-4 my-2 bg-custom-background-80/60 rounded-lg">
              <div className="pt-2 text-xl font-medium">Service provider details</div>
              {SAML_SERVICE_DETAILS.map((field) => (
                <CopyField key={field.key} label={field.label} url={field.url} description={field.description} />
              ))}
              <div className="flex flex-col gap-1">
                <h4 className="text-sm text-custom-text-200 font-medium">Name ID format</h4>
                <p className="text-sm text-custom-text-100">emailAddress</p>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm text-custom-text-200 font-medium">Attribute mapping</h4>
                <ul className="text-sm text-custom-text-100 list-disc pl-6">
                  <li>first_name to user.firstName</li>
                  <li>last_name to user.lastName</li>
                  <li>email to user.email</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
