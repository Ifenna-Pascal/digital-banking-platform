import React, { useState } from "react";
import { Link, Redirect, useHistory, useLocation } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Alert, Field, SubmitButton } from "../Components/ui";

type Mode = "login" | "setup";

interface LocationState {
  from?: { pathname: string };
  email?: string;
  notice?: string;
}

// /login signs in. /register finishes setup: accounts are opened by the bank,
// which gives the customer a one-time setup code to choose their password.
function AuthPage({ mode }: { mode: Mode }) {
  const { profile, login } = useAuth();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const state = location.state || {};

  const [email, setEmail] = useState(state.email || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (profile) return <Redirect to={state.from?.pathname || "/dashboard"} />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "setup" && password !== confirm) {
      setError("The two passwords don't match");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        history.replace(state.from?.pathname || "/dashboard");
      } else {
        await api("/user/setup_password", {
          method: "POST",
          body: { email, setup_token: setupToken.trim(), password },
        });
        history.replace("/login", {
          email,
          notice: "Password set. You can log in now.",
        });
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        <Link to="/" className="block mb-6 text-indigo-500 font-Poppins">
          <i className="fas fa-angle-left mr-1" aria-hidden="true"></i> Back to
          home
        </Link>
        <div className="bg-white shadow-md rounded-xl p-8">
          <h1 className="mb-2 text-2xl font-semibold text-indigo-500 font-Poppins">
            {mode === "login" ? "Log in" : "Finish setting up your account"}
          </h1>
          <p className="mb-6 text-gray-500 font-Poppins">
            {mode === "login"
              ? "Welcome back. Log in to see your balance and move money."
              : "Your account is opened by the bank. Enter the setup code you were given and choose a password."}
          </p>

          {state.notice && !error && (
            <Alert kind="success">{state.notice}</Alert>
          )}
          {error && <Alert kind="error">{error}</Alert>}

          <form onSubmit={handleSubmit} noValidate>
            <Field
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mode === "setup" && (
              <Field
                label="Setup code"
                name="setup_token"
                autoComplete="one-time-code"
                required
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value.toUpperCase())}
                hint="8 characters, from your bank. It expires after 7 days."
              />
            )}
            <Field
              label={mode === "login" ? "Password" : "New password"}
              type="password"
              name="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={mode === "setup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={mode === "setup" ? "At least 8 characters." : undefined}
            />
            {mode === "setup" && (
              <Field
                label="Confirm password"
                type="password"
                name="confirm"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            )}

            <div className="mb-5 font-Poppins text-gray-500">
              {mode === "login" ? (
                <span>
                  Got a setup code?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-indigo-500"
                  >
                    Finish setup
                  </Link>
                </span>
              ) : (
                <span>
                  Already set a password?{" "}
                  <Link to="/login" className="font-semibold text-indigo-500">
                    Log in
                  </Link>
                </span>
              )}
            </div>
            <SubmitButton
              busy={busy}
              label={mode === "login" ? "Log in" : "Set password"}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
