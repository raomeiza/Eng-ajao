import { AuthProvider, RequireAuth } from "../contexts/authContext";
import { Display } from "../utils/device";
import React from "react";
import { useAuth } from "../context/authContext";
import Login from "./login/login";

export default function AllRoutes() {
  const { isDesktop } = Display()
  const [showLoading, setShowLoading] = React.useState(false)
  let {user} = useAuth();
  return (
    <AuthProvider>
      Hello
      {user && JSON.stringify(user)}
      
      {/* <Login setShowLoading={setShowLoading} /> */}
    </AuthProvider>
  )
}