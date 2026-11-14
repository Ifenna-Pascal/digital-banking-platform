import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Nav: React.FC = () => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <li>
        <a href="#features">Features</a>
      </li>
      <li>
        <a href="#how-it-works">How it works</a>
      </li>
      <li>
        <a href="#contact">Contact</a>
      </li>
    </>
  );
  const actions = profile ? (
    <Link to="/dashboard">
      <button type="button">Dashboard</button>
    </Link>
  ) : (
    <>
      <li>
        <Link to="/login">Log in</Link>
      </li>
      <Link to="/register">
        <button type="button">Finish setup</button>
      </Link>
    </>
  );

  return (
    <nav className="w-full px-6 sm:px-10 py-5">
      <div className="flex justify-between md:justify-around items-center gap-x-5">
        <Link
          to="/"
          className="py-1 px-3 bg-indigo-500 rounded flex-shrink-0"
          aria-label="Online Banking home"
        >
          <span className="text-white font-Poppins font-semibold text-lg whitespace-nowrap">
            <i className="fas fa-university mr-2" aria-hidden="true"></i>Online
            Banking
          </span>
        </Link>
        <ul className="hidden md:flex flex-1 justify-center items-center">
          {links}
        </ul>
        <ul className="hidden md:flex items-center">{actions}</ul>
        <span
          role="button"
          tabIndex={0}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
          className="md:hidden text-3xl text-gray-700 cursor-pointer"
        >
          <i
            className={`fas ${open ? "fa-times" : "fa-bars"}`}
            aria-hidden="true"
          ></i>
        </span>
      </div>
      {open && (
        <ul
          className="md:hidden flex flex-col items-start gap-2 mt-4"
          onClick={() => setOpen(false)}
        >
          {links}
          {actions}
        </ul>
      )}
    </nav>
  );
};

export default Nav;
