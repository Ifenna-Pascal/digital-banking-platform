import React, { useState } from "react";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Alert, Card, Field, SubmitButton } from "../Components/ui";

// Runs a submit handler with busy / error / success state.
const useAction = () => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      setMessage(await fn());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, message, run };
};

const Feedback: React.FC<{ error: string; message: string }> = ({
  error,
  message,
}) => (
  <>
    {error && <Alert kind="error">{error}</Alert>}
    {message && <Alert kind="success">{message}</Alert>}
  </>
);

function SettingsPage() {
  const { profile, refresh } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [pin, setPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const profileAction = useAction();
  const pinAction = useAction();
  const passwordAction = useAction();

  if (!profile) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <Card title="Profile">
        <Feedback error={profileAction.error} message={profileAction.message} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            profileAction.run(async () => {
              await api("/user/update_profile", {
                method: "PUT",
                body: { first_name: firstName, last_name: lastName, email },
              });
              await refresh();
              return "Profile updated";
            });
          }}
        >
          <Field
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Field
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label="Account number"
            value={profile.account_details.account_number}
            disabled
            readOnly
          />
          <SubmitButton busy={profileAction.busy} label="Save profile" />
        </form>
      </Card>

      <div className="grid gap-6">
        <Card
          title={
            profile.has_pin ? "Change transaction PIN" : "Set transaction PIN"
          }
        >
          <Feedback error={pinAction.error} message={pinAction.message} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              pinAction.run(async () => {
                await api("/user/setpin", {
                  method: "POST",
                  body: profile.has_pin
                    ? { pin, current_pin: currentPin }
                    : { pin },
                });
                setPin("");
                setCurrentPin("");
                await refresh();
                return "PIN saved";
              });
            }}
          >
            {profile.has_pin && (
              <Field
                label="Current PIN"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPin}
                onChange={(e) =>
                  setCurrentPin(e.target.value.replace(/\D/g, ""))
                }
                required
              />
            )}
            <Field
              label="New 4-digit PIN"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              required
            />
            <SubmitButton busy={pinAction.busy} label="Save PIN" />
          </form>
        </Card>

        <Card title="Change password">
          <Feedback
            error={passwordAction.error}
            message={passwordAction.message}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              passwordAction.run(async () => {
                await api("/user/change_password", {
                  method: "PUT",
                  body: {
                    current_password: currentPassword,
                    new_password: newPassword,
                  },
                });
                setCurrentPassword("");
                setNewPassword("");
                return "Password changed";
              });
            }}
          >
            <Field
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Field
              label="New password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="At least 8 characters."
              required
            />
            <SubmitButton busy={passwordAction.busy} label="Change password" />
          </form>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;
