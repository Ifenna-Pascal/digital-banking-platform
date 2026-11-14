import React from "react";
import { NavLink } from "react-router-dom";
import { NavItem } from "./sideUtil";

function EachNav({
  name,
  icon,
  to,
  onNavigate,
}: NavItem & { onNavigate?: () => void }) {
  return (
    <NavLink
      exact={to === "/dashboard"}
      to={to}
      onClick={onNavigate}
      className="flex items-center gap-4 w-full px-3 py-3 mb-2 rounded-md text-white hover:bg-indigo-700"
      activeClassName="bg-indigo-700"
    >
      <i className={`fas ${icon} w-5 text-center`} aria-hidden="true"></i>
      <span className="text-lg tracking-wide font-semibold">{name}</span>
    </NavLink>
  );
}

export default EachNav;
