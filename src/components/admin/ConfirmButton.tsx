"use client";

import { Button } from "@/components/ui/Button";
import type { ComponentProps } from "react";

// A submit button that asks for confirmation first. Use inside a <form action>.
export function ConfirmButton({
  confirm,
  children,
  ...props
}: ComponentProps<typeof Button> & { confirm: string }) {
  return (
    <Button
      type="submit"
      {...props}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
