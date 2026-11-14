import React from "react";
import { Redirect, Switch, useRouteMatch } from "react-router-dom";
import SideNav from "../Components/Dashboard_side";
import ProtectedRoute from "../Components/ProtectedRoute";
import AdminPage from "./AdminPage";
import MoneyForm from "./MoneyForm";
import Overview from "./Overview";
import SettingsPage from "./SettingsPage";
import TransactionsPage from "./TransactionsPage";

function Dashboard() {
  const { path } = useRouteMatch();
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 min-w-0 p-4 sm:p-8">
        <Switch>
          <ProtectedRoute exact path={path}>
            <Overview />
          </ProtectedRoute>
          <ProtectedRoute path={`${path}/transfer`}>
            <MoneyForm key="transfer" kind="transfer" />
          </ProtectedRoute>
          <ProtectedRoute path={`${path}/deposit`}>
            <MoneyForm key="deposit" kind="deposit" />
          </ProtectedRoute>
          <ProtectedRoute path={`${path}/withdraw`}>
            <MoneyForm key="withdrawal" kind="withdrawal" />
          </ProtectedRoute>
          <ProtectedRoute path={`${path}/transactions`}>
            <TransactionsPage />
          </ProtectedRoute>
          <ProtectedRoute path={`${path}/settings`}>
            <SettingsPage />
          </ProtectedRoute>
          <ProtectedRoute adminOnly path={`${path}/admin`}>
            <AdminPage />
          </ProtectedRoute>
          <Redirect to={path} />
        </Switch>
      </main>
    </div>
  );
}

export default Dashboard;
