import { useNavigate } from "react-router-dom";

import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  return (
    <section className="page-section narrow">
      <AuthForm
        mode="register"
        submitLabel="Create account"
        onSubmit={async ({ name, email, password }) => {
          await register({ name, email, password });
          navigate("/");
        }}
      />
    </section>
  );
}
