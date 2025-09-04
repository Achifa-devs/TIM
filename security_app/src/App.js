/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useRoutes } from "react-router-dom";
import "./App.css";
import rolePermissions from "./utils/Permissions";

function App() {
  let role = "admin";
  const [activeRoutes, setActiveRoutes] = useState([]);

  const generateRoutes = (role) => {
    if (role && rolePermissions[role]) {
      if (role === "admin") {
        const allRoutes = Object.keys(rolePermissions)
          .map((key) => rolePermissions[key])
          .flat();
        setActiveRoutes(
          allRoutes.map((route) => ({
            path: route.path,
            element: route.component,
          }))
        );
      } else {
        setActiveRoutes(
          rolePermissions[role].map((route) => ({
            path: route.path,
            element: route.component,
          }))
        );
      }
    } else {
      setActiveRoutes([]);
    }
  };

  console.log("active routes", activeRoutes);

  useEffect(() => {
    generateRoutes(role);
  }, []);
  const routes = useRoutes([...activeRoutes]);
  return routes;
}

export default App;
