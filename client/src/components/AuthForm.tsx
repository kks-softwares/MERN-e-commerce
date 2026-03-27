import { useState, type FormEvent } from "react";

type AuthFormProps = {
  mode: "login" | "register";
  submitLabel: string;
  onSubmit: (values: { name: string; email: string; password: string }) => Promise<void>;
};

export function AuthForm({ mode, submitLabel, onSubmit }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({ name, email, password });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>

      {mode === "register" && (
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required type="text" />
        </label>
      )}

      <label className="field">
        <span>Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
          type="password"
        />
      </label>

      {error && <p className="error-text">{error}</p>}

      <button className="primary-button" disabled={loading} type="submit">
        {loading ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}
