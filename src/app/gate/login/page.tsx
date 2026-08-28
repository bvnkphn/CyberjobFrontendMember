import LoginForm from "@/components/gate/login-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function LoginPage() { return <div className="site-shell"><Header /><main className="auth-container"><LoginForm /></main><Footer /></div>; }
