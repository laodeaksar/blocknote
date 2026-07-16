"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Field, Form, setErrors, useForm } from "@formisch/react";
import * as v from "valibot";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const SignUpSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Nama wajib diisi")),
  email: v.pipe(
    v.string(),
    v.nonEmpty("Email wajib diisi"),
    v.email("Format email tidak valid"),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Password wajib diisi"),
    v.minLength(8, "Password minimal 8 karakter"),
  ),
});

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";


  const signUpForm = useForm({
    schema: SignUpSchema,
    validate: "submit",
    revalidate: "input",
  });

  const signUpMutation = useMutation({
    mutationFn: async (input: v.InferOutput<typeof SignUpSchema>) => {
      const { data, error } = await authClient.signUp.email({
        name: input.name,
        email: input.email,
        password: input.password,
        callbackURL: callbackUrl,
      });
      if (error) throw new Error(error.message ?? "Tidak dapat membuat akun. Silakan coba lagi.");
      return data;
    },
    onSuccess: () => {
      toast.success("Akun berhasil dibuat");
      router.push(callbackUrl);
    },
    onError: (error: Error) => {
      const message = error.message || "Terjadi kesalahan. Silakan coba lagi.";
      toast.error(message);
      setErrors(signUpForm, { errors: [message] });
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
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Start writing and organizing today
          </p>

          <Form
            of={signUpForm}
            method="post"
            onSubmit={async (output) => {
              try {
                await signUpMutation.mutateAsync(output);
              } catch {
                // surfaced via signUpMutation.onError
              }
            }}
            className="space-y-4"
          >
            {signUpForm.errors && (
              <p className="text-xs text-destructive text-center -mt-1">
                {signUpForm.errors[0]}
              </p>
            )}

            <Field of={signUpForm} path={["name"]}>
              {(field) => (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                    Name
                  </label>
                  <input
                    {...field.props}
                    id="name"
                    type="text"
                    value={field.input ?? ""}
                    aria-invalid={!!field.errors}
                    className={`w-full px-3 py-2 border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground ${
                      field.errors ? "border-destructive" : "border-input"
                    }`}
                    placeholder="Your name"
                  />
                  {field.errors && (
                    <p className="text-xs text-destructive mt-1">{field.errors[0]}</p>
                  )}
                </div>
              )}
            </Field>

            <Field of={signUpForm} path={["email"]}>
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

            <Field of={signUpForm} path={["password"]}>
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
                    placeholder="At least 8 characters"
                  />
                  {field.errors && (
                    <p className="text-xs text-destructive mt-1">{field.errors[0]}</p>
                  )}
                </div>
              )}
            </Field>

            <button
              type="submit"
              disabled={signUpMutation.isPending}
              className="w-full py-2 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signUpMutation.isPending ? "Creating account…" : "Create account"}
            </button>
          </Form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
