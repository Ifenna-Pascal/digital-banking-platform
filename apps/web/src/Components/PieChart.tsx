import React from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// All-time money in vs money out.
function PieChart({ credit, debit }: { credit: number; debit: number }) {
  if (credit === 0 && debit === 0) return null;
  const data = {
    labels: ["Money in", "Money out"],
    datasets: [
      { data: [credit, debit], backgroundColor: ["#22c55e", "#f87171"] },
    ],
  };
  return (
    <div className="max-w-xs mx-auto mt-6">
      <Pie data={data} />
    </div>
  );
}

export default PieChart;
