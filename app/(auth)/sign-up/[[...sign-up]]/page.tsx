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

const signUpSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "Name is required")),
  email: v.pipe(v.string(), v.email("Please enter a valid email address")),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters")
  ),
});

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({ schema: signUpSchema, validateOn: "blur" });
  const nameField = useField(form, { path: ["name"] });
  const emailField = useField(form, { path: ["email"] });
  const passwordField = useField(form, { path: ["password"] });

  const onSubmit = handleSubmit(form, async (values) => {
    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: callbackUrl,
      });
      if (error) {
        toast.error(error.message ?? "Could not create account. Please try again.");
      } else {
        toast.success("Account created! Welcome aboard.");
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
        <h1 className="text-xl font-semibold text-foreground mb-1">Create an account</h1>
        <p className="text-sm text-muted-foreground">Start writing and organizing today</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup className="gap-4">
          {/* Name */}
          <Field data-invalid={!!nameField.errors || undefined}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              aria-invalid={!!nameField.errors}
              {...nameField.props}
            />
            <FieldError
              errors={nameField.errors?.map((msg) => ({ message: msg }))}
            />
          </Field>

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
                autoComplete="new-password"
                placeholder="At least 8 characters"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </FieldGroup>
      </form>

      {/* Footer */}
      <p className="text-sm text-center text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-foreground font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
