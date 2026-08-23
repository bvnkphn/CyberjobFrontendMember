import ResetPasswordForm from "@/components/gate/reset-password-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function RegisterPage() {
  return (
    <div className="site-shell">
        <Header />
        <main className="auth-container">
          <ResetPasswordForm />
        </main>
        <Footer />
    </div>
  );
}