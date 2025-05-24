import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "btn-mystical text-white shadow-mystical hover:shadow-mystical-lg hover:scale-105",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800 hover:scale-105 hover:shadow-xl",
        outline:
          "border border-white/20 bg-white/5 text-white backdrop-blur-lg hover:bg-white/10 hover:border-primary-400/40 hover:scale-105 shadow-mystical",
        secondary:
          "bg-gradient-to-r from-white/10 to-white/5 text-white border border-white/10 backdrop-blur-lg hover:from-white/15 hover:to-white/10 hover:border-white/20 hover:scale-105",
        ghost:
          "text-white hover:bg-white/10 hover:text-primary-200 backdrop-blur-sm rounded-lg",
        link: "text-primary-200 underline-offset-4 hover:underline hover:text-primary-100 transition-colors",
        mystical:
          "btn-mystical text-white font-bold shadow-glow hover:shadow-glow-lg hover:scale-105 animate-glow-pulse",
        ethereal:
          "bg-gradient-to-r from-primary-200/20 via-primary-300/20 to-primary-400/20 text-white border border-primary-300/30 backdrop-blur-lg hover:from-primary-200/30 hover:via-primary-300/30 hover:to-primary-400/30 hover:border-primary-300/50 hover:scale-105 shadow-mystical",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 py-3 text-base font-bold",
        xl: "h-15 rounded-2xl px-10 py-4 text-lg font-bold",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Shimmer effect for mystical variant */}
      {variant === "mystical" && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
        </div>
      )}
      <span className="relative z-10">{children}</span>
    </Comp>
  );
}

export { Button, buttonVariants };
