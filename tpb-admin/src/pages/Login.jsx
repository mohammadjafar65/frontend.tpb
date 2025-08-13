import React, { useState } from "react";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");
    try {
      await login(email, password);
      window.location.replace("/"); // to dashboard
    } catch (e) {
      setErr(e?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-md shadow p-6 w-full max-w-sm">
        <h1 className="text-lg font-semibold mb-4 text-center">Admin Sign In</h1>
        {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input name="email" type="email" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input name="password" type="password" className="w-full border rounded px-3 py-2" />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
