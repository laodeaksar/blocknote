"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import * as v from "valibot";
import { useForm, useField, handleSubmit } from "@formisch/react";

import { authClient } from "@/lib/auth-client";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

const signInSchema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email address")),
  password: v.pipe(v.string(), v.minLength(1, "Password is required")),
});

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({ schema: signInSchema, validateOn: "blur" });
  const emailField = useField(form, { path: ["email"] });
  const passwordField = useField(form, { path: ["password"] });

  const onSubmit = handleSubmit(form, async (values) => {
    setServerError(null);
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: callbackUrl,
      });
      if (error) {
        setServerError(error.message ?? "Invalid email or password");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">N</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Notion Clone</span>
          </div>

          <h1 className="text-xl font-semibold text-foreground text-center mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sign in to your account
          </p>

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

              {/* Server error */}
              {serverError && (
                <FieldError className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {serverError}
                </FieldError>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </FieldGroup>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-foreground font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
