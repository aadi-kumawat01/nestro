"use client";
import ErrorState from "@/components/website/ui/ErrorState";
export default function AuthError({ retry, reset }) {
  return (
    <ErrorState
      retry={retry}
      reset={reset}
      eyebrow="Sign-in interrupted"
      title="We couldn’t open the door"
      message="Your account is safe. Please try loading the sign-in experience again."
    />
  );
}
