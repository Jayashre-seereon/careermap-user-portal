import { Navigate, Outlet } from "react-router-dom";
import { useAppState } from "../../state/AppStateContext";

export function RequireAuth() {
  const { authenticated } = useAppState();
  return authenticated ? <Outlet /> : <Navigate to="/auth-entry" replace />;
}

export function PublicOnly() {
  const { authenticated } = useAppState();
  return authenticated ? <Navigate to="/app/dashboard" replace /> : <Outlet />;
}
