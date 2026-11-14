import React from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { Transaction } from "../types";
import { dayAndMonth, describe, formatMoney } from "../Util/format";

function EachTransaction({ transaction: t }: { transaction: Transaction }) {
  const debit = t.direction === "debit";
  const { day, month } = dayAndMonth(t.created_at);
  return (
    <li className="flex items-center py-3 border-b border-gray-100 last:border-0 list-none m-0 px-0 hover:text-inherit cursor-default">
      <div
        className={`flex w-10 h-10 shrink-0 justify-center items-center rounded-full border ${
          debit ? "border-red-400" : "border-green-500"
        } mr-4`}
        aria-hidden="true"
      >
        {debit ? (
          <RiArrowUpSLine className="text-red-400 text-lg" />
        ) : (
          <RiArrowDownSLine className="text-green-500 text-lg" />
        )}
      </div>
      <div className="text-center mr-4 w-10 shrink-0">
        <div className="text-lg text-gray-500 font-semibold leading-tight">
          {day}
        </div>
        <div className="text-sm text-gray-400">{month}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-gray-700 truncate">{describe(t)}</div>
        <div className="text-sm text-gray-400 truncate">
          {t.transaction_narration || t.transaction_id}
          {t.is_reversed && (
            <span className="ml-2 text-amber-600">(reversed)</span>
          )}
        </div>
      </div>
      <div
        className={`ml-3 font-semibold whitespace-nowrap ${
          debit ? "text-red-400" : "text-green-600"
        }`}
      >
        {debit ? "−" : "+"}
        {formatMoney(t.amount_transacted)}
      </div>
    </li>
  );
}

export default EachTransaction;
