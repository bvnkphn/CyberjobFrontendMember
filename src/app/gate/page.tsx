import { GateForm } from "@/components/gate/gate-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function GatePage() {
  return <div className="site-shell"><Header /><GateForm /><Footer /></div>;
}
