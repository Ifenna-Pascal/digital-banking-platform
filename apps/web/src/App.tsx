import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import AuthPage from "./Pages/AuthPage";
import Dashboard from "./Pages/Dashboard";
import Home from "./Pages/Home";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/login" exact>
            <AuthPage key="login" mode="login" />
          </Route>
          <Route path="/register" exact>
            <AuthPage key="setup" mode="setup" />
          </Route>
          <ProtectedRoute path="/dashboard">
            <Dashboard />
          </ProtectedRoute>
          <Redirect to="/" />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
