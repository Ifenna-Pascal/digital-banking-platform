import React from "react";
import { Link } from "react-router-dom";
import { Profile, Summary } from "../types";
import { formatMoney } from "../Util/format";
import Barchart from "./BarChart";

const Stat: React.FC<{ label: string; value: string; gradient: string }> = ({
  label,
  value,
  gradient,
}) => (
  <div
    className={`flex-1 rounded-lg shadow-lg py-6 px-5 text-white bg-gradient-to-r ${gradient}`}
  >
    <p className="mb-2 text-lg">{label}</p>
    <p className="font-Poppins tracking-wide text-2xl font-semibold break-words">
      {value}
    </p>
  </div>
);

function SideCenter({
  profile,
  summary,
}: {
  profile: Profile;
  summary: Summary;
}) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 sm:p-10 flex flex-col gap-y-10 flex-1 min-w-0">
      <div>
        <h1 className="text-3xl text-gray-600 font-Poppins font-semibold mb-2">
          Hello, {profile.first_name}
        </h1>
        <p className="text-gray-400 font-Poppins text-lg">
          Account {summary.account_number}
          {!profile.isActive && (
            <span className="ml-2 text-red-500">· disabled by the bank</span>
          )}
        </p>
      </div>
      {!profile.has_pin && (
        <div className="border border-amber-200 bg-amber-50 text-amber-800 rounded-md px-4 py-3">
          Set a 4-digit transaction PIN before you can move money.{" "}
          <Link to="/dashboard/settings" className="font-semibold underline">
            Set PIN
          </Link>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-4">
        <Stat
          label="Balance"
          value={formatMoney(summary.account_balance)}
          gradient="from-indigo-500 via-purple-500 to-pink-500"
        />
        <Stat
          label="Total money in"
          value={formatMoney(summary.total_credit)}
          gradient="from-green-400 to-blue-500"
        />
        <Stat
          label="Total money out"
          value={formatMoney(summary.total_debit)}
          gradient="from-pink-500 to-yellow-500"
        />
      </div>
      <Barchart byDay={summary.by_day} />
    </div>
  );
}

export default SideCenter;
