import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Spinner } from "./ui";

interface Props extends RouteProps {
  adminOnly?: boolean;
}

// Sends logged-out visitors to /login (and back here after they log in).
const ProtectedRoute: React.FC<Props> = ({ children, adminOnly, ...rest }) => {
  const { profile, loading } = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (loading) return <Spinner />;
        if (!profile)
          return (
            <Redirect to={{ pathname: "/login", state: { from: location } }} />
          );
        if (adminOnly && profile.role !== "admin")
          return <Redirect to="/dashboard" />;
        return children;
      }}
    />
  );
};

export default ProtectedRoute;
