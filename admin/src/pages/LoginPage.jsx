import { SignIn } from "@clerk/clerk-react";
import logo from "../assets/logo.png";

function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-base-100 via-base-100 to-primary/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-[100px]" />

      {/* Logo Section */}
      <div className="flex items-center gap-3 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards] relative z-10">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
          <img src={logo} alt="Orderker" className="w-9 h-9 object-contain" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-base-content leading-none">
            Orderker<span className="text-primary">.</span>
          </h1>
          <p className="text-xs text-base-content/50 font-medium tracking-wide">Admin Portal</p>
        </div>
      </div>

      {/* Clerk Sign In */}
      <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards] relative z-10">
        <SignIn forceRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
export default LoginPage;
