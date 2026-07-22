"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import * as v from "valibot";
import { useForm, useField, handleSubmit } from "@formisch/react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LoadingButton } from "@/components/ui/loading-button";

const signInSchema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email address")),
  password: v.pipe(v.string(), v.minLength(1, "Password is required")),
});

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({ schema: signInSchema, validateOn: "blur" });
  const emailField = useField(form, { path: ["email"] });
  const passwordField = useField(form, { path: ["password"] });

  const onSubmit = handleSubmit(form, async (values) => {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: callbackUrl,
      });
      if (error) {
        toast.error(error.message ?? "Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push(callbackUrl);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-foreground mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup className="gap-4">
          {/* Email */}
          <Field data-invalid={!!emailField.errors || undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!emailField.errors}
              {...emailField.props}
            />
            <FieldError
              errors={emailField.errors?.map((msg) => ({ message: msg }))}
            />
          </Field>

          {/* Password */}
          <Field data-invalid={!!passwordField.errors || undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!passwordField.errors}
                {...passwordField.props}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldError
              errors={passwordField.errors?.map((msg) => ({ message: msg }))}
            />
          </Field>

          <LoadingButton
            type="submit"
            isPending={loading || form.isValidating}
            loadingText={form.isValidating ? "Validating…" : "Signing in…"}
            className="w-full"
          >
            Sign in
          </LoadingButton>
        </FieldGroup>
      </form>

      {/* Footer */}
      <p className="text-sm text-center text-muted-foreground mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-foreground font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
