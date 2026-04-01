import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TenantDashboard() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/"); }, [navigate]);
  return null;
}
