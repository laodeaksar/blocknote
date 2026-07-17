"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Field as FormischField, Form, setErrors, useForm } from "@formisch/react";
import * as v from "valibot";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Eye } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupButton,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { LoadingButton } from "@/components/ui/loading-button";

const SignInSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty("Email wajib diisi"),
    v.email("Format email tidak valid"),
  ),
  password: v.pipe(v.string(), v.nonEmpty("Password wajib diisi")),
});

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";


  const signInForm = useForm({
    schema: SignInSchema,
    validate: "submit",
    revalidate: "input",
  });

  const signInMutation = useMutation({
    mutationFn: async (input: v.InferOutput<typeof SignInSchema>) => {
      const { data, error } = await authClient.signIn.email({
        email: input.email,
        password: input.password,
        callbackURL: callbackUrl,
      });
      if (error) throw new Error(error.message ?? "Email atau password salah");
      return data;
    },
    onSuccess: () => {
      toast.success("Berhasil masuk");
      router.push(callbackUrl);
    },
    onError: (error: Error) => {
      const message = error.message || "Terjadi kesalahan. Silakan coba lagi.";
      toast.error(message);
      setErrors(signInForm, { errors: [message] });
    },
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

          <Form
            of={signInForm}
            method="post"
            onSubmit={async (output) => {
              try {
                await signInMutation.mutateAsync(output);
              } catch {
                // surfaced via signInMutation.onError
              }
            }}
            className="space-y-4"
          >
            {signInForm.errors && (
              <p className="text-xs text-destructive text-center -mt-1">
                {signInForm.errors[0]}
              </p>
            )}
            <FieldGroup>
            <FormischField of={signInForm} path={["email"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field.props}
                    id="email"
                    type="email"
                    value={field.input ?? ""}
                    aria-invalid={!!field.errors}
                    placeholder="you@example.com"
                  />
                  {field.errors && (
                    <FieldError errors={field.errors.map((message) => ({ message }))} />
                  )}
                </Field>
              )}
            </FormischField>
            </FieldGroup>

            <FieldGroup>
            <FormischField of={signInForm} path={["password"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      { ...field.props }
                      id="password"
                      type="password"
                      value={field.input ?? ""}
                      aria-invalid={!!field.errors}
                      placeholder = "••••••••" />
                       <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Show password"
                title="Show password"
                size="icon-xs"
                onClick={}
              >
                <Eye />
              </InputGroupButton>
            </InputGroupAddon>
                  </InputGroup>
                  {field.errors && (
                    <FieldError errors={field.errors.map((message) => ({ message }))} />
                  )}
                </Field>
              )}
            </FormischField>
            </FieldGroup>
            <LoadingButton
            type="submit"
        disabled={signInMutation.isPending}
        isPending={signInMutation.isPending}
        loadingText="Signing in ..."
        className="w-full"
      >
        Sign in
      </LoadingButton>
          </Form>

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
