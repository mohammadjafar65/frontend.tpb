import React, { useEffect, useRef, useState } from "react";
import api from "../../api";

const Tab = { LOGIN: "login", SIGNUP: "signup" };

export default function AuthModal({ open, onClose }) {
  const [tab, setTab] = useState(Tab.LOGIN);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errors, setErrors] = useState({});
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => dialogRef.current?.focus(), 0);
      const onKey = (e) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null); setErrors({});
    const form = new FormData(e.currentTarget);
    const payload = { email: form.get("email"), password: form.get("password") };
    if (!payload.email || !payload.password) {
      setErrors({ form: "All fields required." }); setLoading(false); return;
    }
    try {
      const { data } = await api.post("/auth/login", payload);
      setMsg("Welcome back!");
      setTimeout(onClose, 600);
    } catch (err) {
      setErrors({ form: err?.response?.data?.error || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null); setErrors({});
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    };
    if (!payload.name || !payload.email || !payload.password) {
      setErrors({ form: "All fields required." }); setLoading(false); return;
    }
    try {
      await api.post("/auth/signup", payload);
      setMsg("Signup successful. You can now log in.");
      setTab(Tab.LOGIN);
    } catch (err) {
      setErrors({ form: err?.response?.data?.error || "Signup failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal_style"
      onMouseDown={onBackdrop}
      aria-modal="true"
      role="dialog"
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="card_modal"
        style={{ maxWidth: 420 }}
        role="document"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="icon-close text-dark-1 modal_cross"
        />
        <div className="mb-20">
          <div className="d-flex gap-10">
            <button
              className={`button -md ${tab === Tab.LOGIN ? "bg-blue-1 text-white" : "bg-blue-1-05 text-blue-1"}`}
              onClick={() => setTab(Tab.LOGIN)}
            >
              Sign In
            </button>
            <button
              className={`button -md ${tab === Tab.SIGNUP ? "bg-blue-1 text-white" : "bg-blue-1-05 text-blue-1"}`}
              onClick={() => setTab(Tab.SIGNUP)}
            >
              Register
            </button>
          </div>
        </div>

        {errors.form && (
          <div className="alert_form -type-1 -light-3 mb-15">{errors.form}</div>
        )}
        {msg && (
          <div className="alert_form -type-1 -green-1 mb-15">{msg}</div>
        )}

        {tab === Tab.LOGIN ? (
          <form onSubmit={handleLogin} className="d-flex flex-column gap-15 form_card">
            <label className="d-flex flex-column">
              <span className="text-13 text-dark-1 mb-5 text-left">Email</span>
              <input name="email" type="email" className="form-input" placeholder="you@email.com" />
            </label>
            <label className="d-flex flex-column">
              <span className="text-13 text-dark-1 mb-5 text-left">Password</span>
              <input name="password" type="password" className="form-input" placeholder="••••••••" />
            </label>
            <button disabled={loading} className="button_submit -md -blue-1 text-white">
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <button
              type="button"
              className="text-13 text-blue-1 self-start"
              onClick={async () => {
                const email = prompt("Enter your email for password reset:");
                if (!email) return;
                try {
                  await api.post("/auth/request-reset", { email });
                  setMsg("If that email exists, a reset link has been sent.");
                } catch {
                  setMsg("If that email exists, a reset link has been sent.");
                }
              }}
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="d-flex flex-column gap-15">
            <label className="d-flex flex-column">
              <span className="text-13 text-dark-1 mb-5 text-left">Full name</span>
              <input name="name" className="form-input" placeholder="Jane Doe" />
            </label>
            <label className="d-flex flex-column">
              <span className="text-13 text-dark-1 mb-5 text-left">Email</span>
              <input name="email" type="email" className="form-input" placeholder="you@email.com" />
            </label>
            <label className="d-flex flex-column">
              <span className="text-13 text-dark-1 mb-5 text-left">Password</span>
              <input name="password" type="password" className="form-input" placeholder="Min 8 characters" />
            </label>
            <button disabled={loading} className="button_submit -md -blue-1 text-white">
              {loading ? "Creating..." : "Create Account"}
            </button>
            <p className="text-12 text-light-1">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </form>
        )}
      </div>
      <style>{`
        .form-input {
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 8px;
          padding: 12px 14px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .form-input:focus {
          border-color: rgba(1,93,224,.6);
          box-shadow: 0 0 0 4px rgba(1,93,224,.08);
        }
        .rounded-8 { border-radius: 8px; }
        .shadow-2 { box-shadow: 0 10px 30px rgba(0,0,0,0.12); }
      `}</style>
    </div>
  );
}
