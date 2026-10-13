import type { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
