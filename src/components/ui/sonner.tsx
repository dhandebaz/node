"use client";

import React, { useEffect } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  useEffect(() => {
    if ((toast as any)._patched) return;
    (toast as any)._patched = true;

    const originalSuccess = toast.success;
    const originalError = toast.error;
    const recent = new Map<
      string,
      { count: number; id: string | number; timer: NodeJS.Timeout }
    >();

    const dedupe = (originalFn: any, msg: any, options?: any) => {
      if (typeof msg !== "string") return originalFn(msg, options);

      const existing = recent.get(msg);
      if (existing) {
        existing.count += 1;
        clearTimeout(existing.timer);
        existing.timer = setTimeout(() => recent.delete(msg), 2000);
        return originalFn(`${msg} (${existing.count})`, {
          ...options,
          id: existing.id,
        });
      }

      const id = originalFn(msg, options);
      const timer = setTimeout(() => recent.delete(msg), 2000);
      recent.set(msg, { count: 1, id, timer });
      return id;
    };

    toast.success = (msg: any, options: any) =>
      dedupe(originalSuccess, msg, options);
    toast.error = (msg: any, options: any) =>
      dedupe(originalError, msg, options);
  }, []);

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-white group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
