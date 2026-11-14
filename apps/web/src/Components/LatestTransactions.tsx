import React from "react";
import { Link } from "react-router-dom";
import { Transaction } from "../types";
import EachTransaction from "./EachTransaction";

function LatestTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-2xl text-gray-600 font-Poppins font-semibold">
          Latest transactions
        </h2>
        <Link
          to="/dashboard/transactions"
          className="text-indigo-500 font-Poppins"
        >
          See all
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-gray-500 py-6">
          No transactions yet.{" "}
          <Link to="/dashboard/deposit" className="text-indigo-500">
            Make a deposit
          </Link>{" "}
          to get started.
        </p>
      ) : (
        <ul className="p-0 m-0">
          {transactions.map((t) => (
            <EachTransaction key={t._id} transaction={t} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default LatestTransactions;
