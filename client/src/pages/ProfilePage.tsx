import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section className="page-section narrow">
      <div className="card">
        <p className="eyebrow">Authenticated user</p>
        <h1>{user.name}</h1>
        <div className="profile-grid">
          <div>
            <span className="muted">Email</span>
            <p>{user.email}</p>
          </div>
          <div>
            <span className="muted">Role</span>
            <p>{user.role}</p>
          </div>
          <div>
            <span className="muted">User ID</span>
            <p className="token-preview">{user._id}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
