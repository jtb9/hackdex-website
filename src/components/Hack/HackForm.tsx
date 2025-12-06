"use client";

import React from "react";
import HackSubmitForm from "@/components/Hack/HackSubmitForm";
import HackEditForm from "@/components/Hack/HackEditForm";

type Mode = "create" | "edit";

interface HackFormCreateProps {
  mode: "create";
  dummy?: boolean;
  isArchive?: boolean;
  permissionFrom?: string;
  customCreator?: string;
}

interface HackFormEditProps {
  mode: "edit";
  slug: string;
  initial: React.ComponentProps<typeof HackEditForm>["initial"];
}

export type HackFormProps = HackFormCreateProps | HackFormEditProps;

export default function HackForm(props: HackFormProps) {
  if (props.mode === "create") {
    return <HackSubmitForm
      dummy={props.dummy}
      isArchive={props.isArchive}
      permissionFrom={props.permissionFrom}
      customCreator={props.customCreator}
    />;
  }
  return <HackEditForm slug={props.slug} initial={props.initial} />;
}


