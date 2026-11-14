import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Alert, Card, Field, SubmitButton } from "../Components/ui";
import { Transaction } from "../types";
import { formatMoney } from "../Util/format";

type Kind = "deposit" | "withdrawal" | "transfer";

const COPY: Record<
  Kind,
  { title: string; action: string; noun: string; path: string }
> = {
  deposit: {
    title: "Deposit money",
    action: "Deposit",
    noun: "Deposit",
    path: "/transaction/deposit",
  },
  withdrawal: {
    title: "Withdraw money",
    action: "Withdraw",
    noun: "Withdrawal",
    path: "/transaction/withdrawal",
  },
  transfer: {
    title: "Send money",
    action: "Send",
    noun: "Transfer",
    path: "/transaction/transfer",
  },
};

interface Result {
  details: {
    transaction: Transaction;
    account_balance: number;
    beneficiary?: { name: string };
  };
}

function MoneyForm({ kind }: { kind: Kind }) {
  const { profile, refresh } = useAuth();
  const copy = COPY[kind];

  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [narration, setNarration] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [recipient, setRecipient] = useState<{ name?: string; error?: string }>(
    {}
  );
  const [error, setError] = useState("");
  const [done, setDone] = useState<Result["details"] | null>(null);
  const [busy, setBusy] = useState(false);

  // show who the money is going to as soon as a full account number is typed
  useEffect(() => {
    if (kind !== "transfer" || !/^\d{10}$/.test(accountNumber)) {
      setRecipient({});
      return;
    }
    let alive = true;
    api<{ account: { name: string } }>(`/transaction/lookup/${accountNumber}`)
      .then((res) => alive && setRecipient({ name: res.account.name }))
      .catch((err) => alive && setRecipient({ error: errorMessage(err) }));
    return () => {
      alive = false;
    };
  }, [kind, accountNumber]);

  if (!profile) return null;

  if (!profile.has_pin) {
    return (
      <Card title={copy.title} className="max-w-xl">
        <Alert kind="info">
          You need a transaction PIN first.{" "}
          <Link to="/dashboard/settings" className="font-semibold underline">
            Set your PIN
          </Link>
        </Alert>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDone(null);
    if (kind === "transfer" && !recipient.name) {
      setError(recipient.error || "Enter a valid 10-digit account number");
      return;
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = { amount: amount.trim(), pin };
      if (narration.trim()) body.narration = narration.trim();
      if (kind === "transfer") body.account_number = accountNumber;
      const res = await api<Result>(copy.path, { method: "POST", body });
      setDone(res.details);
      setAmount("");
      setPin("");
      setNarration("");
      setAccountNumber("");
      refresh().catch(() => undefined);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title={copy.title} className="max-w-xl">
      <p className="text-gray-500 mb-6">
        Available balance:{" "}
        <span className="font-semibold text-gray-700">
          {formatMoney(profile.account_details.account_balance)}
        </span>
      </p>
      {done && (
        <Alert kind="success">
          {copy.noun} of {formatMoney(done.transaction.amount_transacted)}{" "}
          complete
          {done.beneficiary ? ` to ${done.beneficiary.name}` : ""}. New balance{" "}
          {formatMoney(done.account_balance)}.
          <span className="block text-sm mt-1">
            Reference {done.transaction.transaction_id}
          </span>
        </Alert>
      )}
      {error && <Alert kind="error">{error}</Alert>}
      <form onSubmit={handleSubmit} noValidate>
        {kind === "transfer" && (
          <Field
            label="Recipient account number"
            inputMode="numeric"
            maxLength={10}
            required
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, ""))
            }
            hint={
              recipient.name
                ? `Sending to ${recipient.name}`
                : recipient.error || "10 digits"
            }
          />
        )}
        <Field
          label="Amount"
          inputMode="decimal"
          required
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
        />
        <Field
          label={kind === "transfer" ? "Description" : "Description (optional)"}
          maxLength={140}
          required={kind === "transfer"}
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
        />
        <Field
          label="Transaction PIN"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          required
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        />
        <SubmitButton busy={busy} label={copy.action} busyLabel="Processing…" />
      </form>
    </Card>
  );
}

export default MoneyForm;
