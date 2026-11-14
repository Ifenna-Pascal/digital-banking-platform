import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import EachNav from "./EachNav";
import { NAV_ITEMS } from "./sideUtil";

function SideNav() {
  const { profile, logout } = useAuth();
  const [show, setShow] = useState(false);
  const items = NAV_ITEMS.filter(
    (item) => !item.adminOnly || profile?.role === "admin"
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-indigo-500 px-4 py-3">
        <span className="text-white font-Poppins font-semibold">
          Online Banking
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label={show ? "Close menu" : "Open menu"}
          onClick={() => setShow(!show)}
          onKeyDown={(e) => e.key === "Enter" && setShow(!show)}
          className="text-white text-2xl cursor-pointer"
        >
          <i
            className={`fas ${show ? "fa-times" : "fa-bars"}`}
            aria-hidden="true"
          ></i>
        </span>
      </div>
      <nav
        aria-label="Dashboard"
        className={`${
          show ? "flex" : "hidden"
        } md:flex flex-col bg-indigo-500 shadow-2xl md:min-h-screen px-5 py-6 md:w-60 w-full shrink-0`}
      >
        <div className="hidden md:block text-white font-Poppins text-xl font-semibold mb-10 px-3">
          Online Banking
        </div>
        {items.map((item) => (
          <EachNav key={item.to} {...item} onNavigate={() => setShow(false)} />
        ))}
        <button
          type="button"
          onClick={logout}
          className="mt-6 bg-transparent hover:bg-indigo-700 text-lg px-3 py-3 text-left font-semibold"
        >
          <i className="fas fa-sign-out-alt mr-4" aria-hidden="true"></i>Log out
        </button>
      </nav>
    </>
  );
}

export default SideNav;
