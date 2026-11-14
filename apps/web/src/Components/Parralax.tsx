import React, { useState } from "react";

const SUPPORT_EMAIL =
  process.env.REACT_APP_SUPPORT_EMAIL || "support@example.com";

const field =
  "block w-full px-3 py-4 mb-5 bg-white border border-gray-300 rounded-md text-md text-gray-600 shadow-sm focus:outline-none placeholder-gray-600";

// There is no contact endpoint in the API, so the form opens the visitor's
// email app with the message filled in, addressed to REACT_APP_SUPPORT_EMAIL.
function Parralax() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name || "a visitor"}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div id="contact">
      <header className="flex items-center justify-center h-96 bg-fixed bg-center bg-cover bg-hero">
        <div className="px-5 py-8 bg-gray-200 bg-opacity-50 rounded-xl">
          <h2 className="text-center text-4xl font-Poppins text-gray-700 font-bold">
            Contact us
          </h2>
        </div>
      </header>
      <div className="max-w-full bg-indigo-600 flex items-center justify-center flex-col">
        <form
          onSubmit={handleSubmit}
          className="w-3/4 sm:w-1/2 mx-auto flex flex-col py-24"
        >
          <label className="sr-only" htmlFor="contact-name">
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            placeholder="Your name"
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="sr-only" htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            required
            placeholder="How can we help?"
            className={`${field} h-32`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-lg font-semibold"
          >
            Email us
          </button>
          <p className="text-indigo-100 text-sm mt-3 text-center">
            Opens your email app, addressed to {SUPPORT_EMAIL}.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Parralax;
