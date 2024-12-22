import { useState, useEffect } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AccessCodeManager } from "@/components/admin/AccessCodeManager";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin");
    if (adminStatus === "true") {
      setIsAdmin(true);
    }
  }, []);

  if (!isAdmin) {
    return <AdminLogin onLoginSuccess={() => setIsAdmin(true)} />;
  }

  return <AccessCodeManager />;
};

export default Admin;