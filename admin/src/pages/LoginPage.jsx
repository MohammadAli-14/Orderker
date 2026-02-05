import { SignIn } from "@clerk/clerk-react";

function LoginPage() {
  return (
    <div className="h-screen hero">
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  );
}
export default LoginPage;
