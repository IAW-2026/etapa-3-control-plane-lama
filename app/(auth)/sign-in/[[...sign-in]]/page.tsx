import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="lama-auth-page">
      <div className="lama-auth-layout">
        <section className="lama-auth-copy" aria-label="Acceso administrativo">
          <p className="lama-kicker">CONTROL PLANE</p>
          <h1 className="lama-auth-title">
            Ingresar al panel de administracion
          </h1>
          <p className="lama-auth-description">
            Acceso protegido para ingresar al panel administrativo del sistema
            completo.
          </p>
        </section>

        <div className="lama-auth-card">
          <div className="lama-auth-card-inner">
            <SignIn
              path="/sign-in"
              routing="path"
              fallbackRedirectUrl="/"
              appearance={{
                variables: {
                  colorPrimary: "#3f3f46",
                  colorText: "#111827",
                  colorTextSecondary: "#6b7280",
                  colorBackground: "#ffffff",
                  colorInputBackground: "#ffffff",
                  colorInputText: "#111827",
                  borderRadius: "8px",
                },
                elements: {
                  rootBox: "lama-clerk-root",
                  cardBox: "lama-clerk-card-box",
                  card: "lama-clerk-card",
                  headerTitle: "lama-clerk-title",
                  headerSubtitle: "lama-clerk-subtitle",
                  socialButtonsBlockButton: "lama-clerk-social-button",
                  dividerLine: "lama-clerk-divider-line",
                  dividerText: "lama-clerk-divider-text",
                  formFieldLabel: "lama-clerk-label",
                  formFieldInput: "lama-clerk-input",
                  formButtonPrimary: "lama-clerk-primary-button",
                  footer: "lama-clerk-footer",
                  footerActionText: "lama-clerk-footer-text",
                  footerActionLink: "lama-clerk-footer-link",
                },
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
