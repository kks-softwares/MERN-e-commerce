import { useNavigate } from "react-router-dom";

import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <section className="page-section narrow">
      <AuthForm
        mode="login"
        submitLabel="Login"
        onSubmit={async ({ email, password }) => {
          await login({ email, password });
          navigate("/");
        }}
      />
    </section>
  );
}
