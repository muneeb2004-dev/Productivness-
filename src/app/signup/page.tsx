/* =============================================================================
   Signup Page — /signup (Bootstrap Redesign)
   ============================================================================= */

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Account created! Please check your email to verify.");
      router.push("/login");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative" style={{ background: "var(--bs-body-bg)" }}>
      {/* Theme toggle */}
      <div className="position-absolute top-0 end-0 p-4">
        <ThemeToggle />
      </div>

      {/* Decorative gradient blobs */}
      <div className="position-absolute" style={{ top: "15%", right: "8%", width: 280, height: 280, background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.06), transparent 70%)", borderRadius: "50%" }}></div>
      <div className="position-absolute" style={{ bottom: "8%", left: "5%", width: 220, height: 220, background: "radial-gradient(circle, rgba(167, 139, 250, 0.05), transparent 70%)", borderRadius: "50%" }}></div>

      <div className="container" style={{ maxWidth: 460, zIndex: 1 }}>
        <div className="card card-custom shadow-lg p-4 p-md-5">
          <div className="card-body">
            {/* Header */}
            <div className="text-center mb-4">
              <Link href="/" className="text-decoration-none">
                <h1 className="gradient-text fw-bold fs-2 mb-2">
                  <i className="bi bi-lightning-charge-fill me-2"></i>productivness
                </h1>
              </Link>
              <p className="text-body-secondary">Create your account to get started.</p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold small">Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-body-secondary border-end-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="form-control border-start-0 ps-0"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold small">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-body-secondary border-end-0">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="form-control border-start-0 ps-0"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label fw-semibold small">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-body-secondary border-end-0">
                    <i className="bi bi-shield-lock"></i>
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="form-control border-start-0 ps-0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-accent w-100 py-2 fw-semibold rounded-3"
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>Sign Up
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-body-secondary small mt-4 mb-0">
              Already have an account?{" "}
              <Link href="/login" className="fw-semibold text-decoration-none" style={{ color: "var(--accent)" }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
