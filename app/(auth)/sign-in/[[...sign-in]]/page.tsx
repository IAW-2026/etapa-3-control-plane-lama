import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-lama-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-lama-muted">
            LAMA
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-lama-text">
            Control Plane
          </h1>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#8fa18d",
              colorText: "#37413d",
              colorBackground: "#fffdf8",
              colorInputBackground: "#fffdf8",
              colorInputText: "#37413d",
              borderRadius: "8px",
            },
          }}
        />
      </div>
    </main>
  );
}
