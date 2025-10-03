"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

interface SubmitButtonProps {
  disabled?: boolean;
}

export function Submitbutton({ disabled = false }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const isDisabled = pending || disabled;

  return (
    <Button className="w-fit" type="submit" disabled={isDisabled}>
      {isDisabled ? "Submitting..." : "Submit"}
    </Button>
  );
}
