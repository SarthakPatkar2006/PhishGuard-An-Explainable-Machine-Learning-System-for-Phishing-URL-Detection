import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-4",
        lg: "h-12 px-5 text-base",
        sm: "h-9 px-3",
      },
      variant: {
        default: "bg-teal-600 text-white hover:bg-teal-700",
        ghost: "hover:bg-slate-100",
        outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
        secondary: "border border-white/20 bg-white/10 text-white hover:bg-white/20",
      },
    },
  },
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ size, variant }), className)} {...props} />;
}

export { Button };
