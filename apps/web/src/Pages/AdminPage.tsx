import React, { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import {
  Alert,
  Card,
  Field,
  Spinner,
  SubmitButton,
  inputClass,
} from "../Components/ui";
import { Party, Profile, Transaction } from "../types";
import { formatDate, formatMoney } from "../Util/format";

interface SetupCode {
  email: string;
  setup_token: string;
  setup_token_expires: string;
}

const smallButton = "px-3 py-1 text-sm";

function AdminPage() {
  const { profile: me } = useAuth();
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [setup, setSetup] = useState<SetupCode | null>(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [u, t] = await Promise.all([
        api<{ users: Profile[] }>("/admin/users?limit=50"),
        api<{ transactions: Transaction[] }>("/admin/transactions?limit=30"),
      ]);
      setUsers(u.users);
      setTransactions(t.transactions);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // runs an admin action, shows its result, then reloads the tables
  const act = async (fn: () => Promise<string>) => {
    setError("");
    setNotice("");
    try {
      setNotice(await fn());
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSetup(null);
    await act(async () => {
      const res = await api<SetupCode & { data: Profile }>(
        "/admin/create_user",
        {
          method: "POST",
          body: { email, first_name: firstName, last_name: lastName, role },
        }
      );
      setSetup({
        email: res.data.email,
        setup_token: res.setup_token,
        setup_token_expires: res.setup_token_expires,
      });
      setEmail("");
      setFirstName("");
      setLastName("");
      setRole("user");
      return `Account ${res.data.account_details.account_number} opened for ${res.data.first_name}.`;
    });
    setBusy(false);
  };

  const resend = (u: Profile) =>
    act(async () => {
      const res = await api<SetupCode>(`/admin/resend_setup/${u._id}`, {
        method: "POST",
      });
      setSetup({
        email: u.email,
        setup_token: res.setup_token,
        setup_token_expires: res.setup_token_expires,
      });
      return `New setup code issued for ${u.email}.`;
    });

  const toggle = (u: Profile) =>
    act(async () => {
      await api(`/admin/${u.isActive ? "disable" : "enable"}_user/${u._id}`, {
        method: "PUT",
      });
      return `${u.email} ${u.isActive ? "disabled" : "enabled"}.`;
    });

  const remove = (u: Profile) => {
    if (
      !window.confirm(
        `Delete ${u.email} and all their transactions? This can't be undone.`
      )
    )
      return;
    act(async () => {
      await api(`/admin/delete_user/${u._id}`, { method: "DELETE" });
      return `${u.email} deleted.`;
    });
  };

  const reverse = (t: Transaction) => {
    if (
      !window.confirm(
        `Reverse transfer ${t.transaction_id} of ${formatMoney(
          t.amount_transacted
        )}?`
      )
    )
      return;
    act(async () => {
      await api(`/admin/reverse_transaction/${t.transaction_id}`, {
        method: "PUT",
      });
      return `Transfer ${t.transaction_id} reversed.`;
    });
  };

  const owner = (t: Transaction) => {
    const u = t.user_id as Party | undefined;
    return u && typeof u === "object"
      ? `${u.first_name} ${u.last_name}`
      : "Deleted user";
  };

  return (
    <div className="grid gap-6">
      {error && <Alert kind="error">{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}
      {setup && (
        <Alert kind="info">
          Setup code for <strong>{setup.email}</strong>:{" "}
          <span className="font-mono text-lg tracking-widest">
            {setup.setup_token}
          </span>
          <span className="block text-sm mt-1">
            Give it to the customer so they can choose a password at /register.
            Expires {formatDate(setup.setup_token_expires)}. It won't be shown
            again.
          </span>
        </Alert>
      )}

      <Card title="Open an account" className="max-w-xl">
        <form onSubmit={createUser}>
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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
          <label className="block mb-5">
            <span className="block text-md font-medium text-gray-700">
              Role
            </span>
            <select
              className={inputClass}
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
            >
              <option value="user">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <SubmitButton busy={busy} label="Open account" />
        </form>
      </Card>

      <Card title="Customers">
        {!users ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Account</th>
                  <th className="py-2 pr-4 font-medium text-right">Balance</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-gray-100 align-top"
                  >
                    <td className="py-3 pr-4">
                      {u.first_name} {u.last_name}
                      {u.role === "admin" && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 rounded px-2">
                          admin
                        </span>
                      )}
                      <div className="text-sm text-gray-400">{u.email}</div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-sm">
                      {u.account_details.account_number}
                    </td>
                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                      {formatMoney(u.account_details.account_balance)}
                    </td>
                    <td className="py-3 pr-4">
                      {u.isActive ? (
                        "Active"
                      ) : (
                        <span className="text-red-500">Disabled</span>
                      )}
                    </td>
                    <td className="py-3">
                      {u._id !== me?._id && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={smallButton}
                            onClick={() => toggle(u)}
                          >
                            {u.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            className={`${smallButton} bg-gray-500`}
                            onClick={() => resend(u)}
                          >
                            New setup code
                          </button>
                          <button
                            type="button"
                            className={`${smallButton} bg-red-500 hover:bg-red-700`}
                            onClick={() => remove(u)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Recent transactions">
        {!transactions ? (
          <Spinner />
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Account holder</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium text-right">Amount</th>
                  <th className="py-2 pr-4 font-medium">Reference</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 text-sm whitespace-nowrap">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="py-3 pr-4">{owner(t)}</td>
                    <td className="py-3 pr-4">
                      {t.transaction_type} ({t.direction})
                      {t.is_reversed && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 rounded px-2">
                          reversed
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                      {formatMoney(t.amount_transacted)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-sm">
                      {t.transaction_id}
                    </td>
                    <td className="py-3">
                      {t.transaction_type === "transfer" &&
                        t.direction === "debit" &&
                        !t.is_reversed && (
                          <button
                            type="button"
                            className={smallButton}
                            onClick={() => reverse(t)}
                          >
                            Reverse
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminPage;
