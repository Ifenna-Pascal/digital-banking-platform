import React from "react";

// Shared form and feedback pieces so every page looks the same.

export const inputClass =
  "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-md shadow-sm placeholder-gray-400 " +
  "focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const Field: React.FC<FieldProps> = ({ label, hint, ...input }) => (
  <label className="block mb-5">
    <span className="block text-md font-medium text-gray-700">{label}</span>
    <input className={inputClass} {...input} />
    {hint && <span className="block mt-1 text-sm text-gray-500">{hint}</span>}
  </label>
);

export const Alert: React.FC<{ kind: "error" | "success" | "info" }> = ({
  kind,
  children,
}) => {
  const styles = {
    error: "bg-red-50 text-red-700 border-red-200",
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-indigo-50 text-indigo-800 border-indigo-200",
  }[kind];
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`border rounded-md px-4 py-3 mb-5 text-md ${styles}`}
    >
      {children}
    </div>
  );
};

export const Card: React.FC<{ title?: string; className?: string }> = ({
  title,
  className = "",
  children,
}) => (
  <section className={`bg-white shadow-md rounded-xl p-6 sm:p-8 ${className}`}>
    {title && (
      <h2 className="text-2xl text-gray-600 font-Poppins font-semibold mb-5">
        {title}
      </h2>
    )}
    {children}
  </section>
);

export const Spinner: React.FC<{ label?: string }> = ({
  label = "Loading…",
}) => (
  <div
    className="flex items-center justify-center py-16 text-gray-500 font-Poppins"
    role="status"
  >
    <i className="fas fa-circle-notch fa-spin mr-3" aria-hidden="true"></i>
    {label}
  </div>
);

export const SubmitButton: React.FC<{
  busy: boolean;
  label: string;
  busyLabel?: string;
}> = ({ busy, label, busyLabel }) => (
  <button
    type="submit"
    disabled={busy}
    className="text-md disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {busy ? busyLabel || "Please wait…" : label}
  </button>
);
