"use client";
import ErrorState from "@/components/website/ui/ErrorState";
export default function Error({ error, retry, reset }) {
  return (
    <ErrorState
      retry={retry}
      reset={reset}
      message={
        error?.digest
          ? `We couldn’t load this page. Reference: ${error.digest}`
          : undefined
      }
    />
  );
}
