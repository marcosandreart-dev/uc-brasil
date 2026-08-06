import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg" | "icon";
}

const buttonVariants = {
  variant: {
    default:
      "bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-500",
    ghost:
      "text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-500",
    destructive:
      "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500",
  },
  size: {
    sm: "h-8 rounded-md px-3 text-xs",
    default: "h-10 rounded-md px-4 py-2 text-sm",
    lg: "h-12 rounded-md px-6 text-base",
    icon: "h-10 w-10 rounded-md",
  },
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
