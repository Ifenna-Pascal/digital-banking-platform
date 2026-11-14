import { Transaction } from "../types";

const money = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const SYMBOL = process.env.REACT_APP_CURRENCY_SYMBOL ?? "₦";

export const formatMoney = (value: number) =>
  `${SYMBOL}${money.format(value || 0)}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const dayAndMonth = (iso: string) => {
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleString(undefined, { month: "short" }),
  };
};

// The other person in a transfer or reversal: who sent it (credit) or who received it (debit).
export const counterparty = (t: Transaction) => {
  const party = t.direction === "credit" ? t.from : t.to;
  return party && typeof party === "object"
    ? `${party.first_name} ${party.last_name}`
    : null;
};

export const describe = (t: Transaction) => {
  const who = counterparty(t);
  switch (t.transaction_type) {
    case "transfer":
      return who
        ? `${t.direction === "credit" ? "From" : "To"} ${who}`
        : "Transfer";
    case "reversal":
      return who
        ? `Reversal ${t.direction === "credit" ? "from" : "to"} ${who}`
        : "Reversal";
    case "deposit":
      return "Deposit";
    default:
      return "Withdrawal";
  }
};
