import { SignIn } from "@clerk/clerk-react";
import logo from "../assets/logo.png";

function LoginPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-base-100">
      <div className="flex items-center gap-2 mb-2">
        <img src={logo} alt="Orderker" className="w-12 h-12 object-contain" />
        <h1 className="text-3xl font-bold tracking-tight text-base-content">
          Orderker<span className="text-primary">.</span>
        </h1>
      </div>
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  );
}
export default LoginPage;
