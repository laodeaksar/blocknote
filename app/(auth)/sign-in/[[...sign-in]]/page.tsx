"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Field, Form, setErrors, useForm } from "@formisch/react";
import * as v from "valibot";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

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
            noValidate
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

            <Field of={signInForm} path={["email"]}>
              {(field) => (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <input
                    {...field.props}
                    id="email"
                    type="email"
                    value={field.input ?? ""}
                    aria-invalid={!!field.errors}
                    className={`w-full px-3 py-2 border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground ${
                      field.errors ? "border-destructive" : "border-input"
                    }`}
                    placeholder="you@example.com"
                  />
                  {field.errors && (
                    <p className="text-xs text-destructive mt-1">{field.errors[0]}</p>
                  )}
                </div>
              )}
            </Field>

            <Field of={signInForm} path={["password"]}>
              {(field) => (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                    Password
                  </label>
                  <input
                    {...field.props}
                    id="password"
                    type="password"
                    value={field.input ?? ""}
                    aria-invalid={!!field.errors}
                    className={`w-full px-3 py-2 border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground ${
                      field.errors ? "border-destructive" : "border-input"
                    }`}
                    placeholder="••••••••"
                  />
                  {field.errors && (
                    <p className="text-xs text-destructive mt-1">{field.errors[0]}</p>
                  )}
                </div>
              )}
            </Field>

            <button
              type="submit"
              disabled={signInMutation.isPending}
              className="w-full py-2 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signInMutation.isPending ? "Signing in…" : "Sign in"}
            </button>
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
