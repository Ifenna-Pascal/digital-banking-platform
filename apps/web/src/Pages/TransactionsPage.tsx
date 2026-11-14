import React, { useEffect, useState } from "react";
import { api, errorMessage } from "../api/client";
import { Alert, Card, Spinner, inputClass } from "../Components/ui";
import { Pagination, Transaction, TransactionType } from "../types";
import { describe, formatDate, formatMoney } from "../Util/format";

const TYPES: ("" | TransactionType)[] = [
  "",
  "transfer",
  "deposit",
  "withdrawal",
  "reversal",
];

function TransactionsPage() {
  const [type, setType] = useState<"" | TransactionType>("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Transaction[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setItems(null);
    const query = new URLSearchParams({ page: String(page), limit: "15" });
    if (type) query.set("type", type);
    api<{ user_transactions: Transaction[]; pagination: Pagination }>(
      `/user/transactions?${query}`
    )
      .then((res) => {
        if (!alive) return;
        setItems(res.user_transactions);
        setPagination(res.pagination);
      })
      .catch((err) => alive && setError(errorMessage(err)));
    return () => {
      alive = false;
    };
  }, [type, page]);

  return (
    <Card title="Transactions">
      <label className="block mb-6 max-w-xs">
        <span className="block text-md font-medium text-gray-700">Show</span>
        <select
          className={inputClass}
          value={type}
          onChange={(e) => {
            setType(e.target.value as "" | TransactionType);
            setPage(1);
          }}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t ? t[0].toUpperCase() + t.slice(1) + "s" : "All transactions"}
            </option>
          ))}
        </select>
      </label>

      {error && <Alert kind="error">{error}</Alert>}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && (
        <p className="text-gray-500">No transactions to show.</p>
      )}
      {items && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-700">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Details</th>
                <th className="py-2 pr-4 font-medium text-right">Amount</th>
                <th className="py-2 pr-4 font-medium text-right">
                  Balance after
                </th>
                <th className="py-2 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id} className="border-b border-gray-100 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap text-sm">
                    {formatDate(t.created_at)}
                  </td>
                  <td className="py-3 pr-4">
                    {describe(t)}
                    {t.is_reversed && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-800 rounded px-2 py-0.5">
                        Reversed
                      </span>
                    )}
                    {t.transaction_narration && (
                      <div className="text-sm text-gray-400">
                        {t.transaction_narration}
                      </div>
                    )}
                  </td>
                  <td
                    className={`py-3 pr-4 text-right whitespace-nowrap font-semibold ${
                      t.direction === "debit"
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {t.direction === "debit" ? "−" : "+"}
                    {formatMoney(t.amount_transacted)}
                  </td>
                  <td className="py-3 pr-4 text-right whitespace-nowrap">
                    {formatMoney(t.current_balance)}
                  </td>
                  <td className="py-3 font-mono text-sm">{t.transaction_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.pages}
            onClick={() => setPage(page + 1)}
            className="disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </Card>
  );
}

export default TransactionsPage;
