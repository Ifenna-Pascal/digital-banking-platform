import React, { useEffect, useState } from "react";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import SideCenter from "../Components/SideCenter";
import SideEnd from "../Components/SideEnd";
import { Alert, Spinner } from "../Components/ui";
import { Summary, Transaction } from "../types";

function Overview() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [latest, setLatest] = useState<Transaction[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([
      api<{ summary: Summary }>("/user/summary"),
      api<{ user_transactions: Transaction[] }>("/user/transactions?limit=6"),
    ])
      .then(([s, t]) => {
        if (!alive) return;
        setSummary(s.summary);
        setLatest(t.user_transactions);
      })
      .catch((err) => alive && setError(errorMessage(err)));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <Alert kind="error">{error}</Alert>;
  if (!summary || !profile) return <Spinner />;

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <SideCenter profile={profile} summary={summary} />
      <SideEnd summary={summary} transactions={latest} />
    </div>
  );
}

export default Overview;
