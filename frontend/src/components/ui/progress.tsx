import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "../../lib/utils";

function Progress({ className, value = 0, ...props }: ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root className={cn("relative h-2.5 overflow-hidden rounded-full bg-slate-200", className)} {...props}>
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-teal-600 transition-transform"
        style={{ transform: `translateX(-${100 - Number(value)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
