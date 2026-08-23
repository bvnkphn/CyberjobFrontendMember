import ForgotPasswordForm from "@/components/gate/forgot-password-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function RegisterPage() {
  return (
    <div className="site-shell">
        <Header />
        <main className="auth-container">
          <ForgotPasswordForm />
        </main>
        <Footer />
    </div>
  );
}