import React from "react";
import { Summary, Transaction } from "../types";
import LatestTransactions from "./LatestTransactions";
import PieChart from "./PieChart";

function SideEnd({
  summary,
  transactions,
}: {
  summary: Summary;
  transactions: Transaction[];
}) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 sm:p-8 xl:w-96 shrink-0">
      <LatestTransactions transactions={transactions} />
      <PieChart credit={summary.total_credit} debit={summary.total_debit} />
    </div>
  );
}

export default SideEnd;
