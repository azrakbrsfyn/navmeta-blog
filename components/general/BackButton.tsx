"use client";

import { useRouter } from "next/navigation";
import { buttonVariants } from "../ui/button";

export default function BackButton() {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };

  return (
    <button onClick={handleBack} className={buttonVariants()}>
      Back
    </button>
  );
}
