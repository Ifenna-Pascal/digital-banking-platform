import React from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Summary } from "../types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const options: ChartOptions<"bar"> = {
  responsive: true,
  plugins: { legend: { position: "top" } },
  scales: { y: { beginAtZero: true } },
};

// Money in and out per day for the last 7 days.
function Barchart({ byDay }: { byDay: Summary["by_day"] }) {
  const labels = byDay.map((d) =>
    new Date(`${d.day}T00:00:00Z`).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      timeZone: "UTC",
    })
  );
  const data = {
    labels,
    datasets: [
      {
        label: "Money in",
        data: byDay.map((d) => d.credit),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
      },
      {
        label: "Money out",
        data: byDay.map((d) => d.debit),
        backgroundColor: "rgba(248, 113, 113, 0.7)",
      },
    ],
  };
  return (
    <div className="w-full">
      <h3 className="text-gray-600 font-Poppins font-semibold text-xl mb-4">
        Last 7 days
      </h3>
      <Bar options={options} data={data} />
    </div>
  );
}

export default Barchart;
