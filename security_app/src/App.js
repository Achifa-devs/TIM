import './App.css';
import rolePermissions from "./utils/Permissions";
import {
  useRoutes
} from 'react-router-dom'
import { 
  useEffect, 
  useState 
} from 'react';
import { 
  useDispatch, 
  useSelector 
} from 'react-redux';

function App() {
  let role = 'admin'
  const [activeRoutes, setActiveRoutes] = useState([]);
  const dispatch = useDispatch();
  
  const generateRoutes = (role) => {
    if (role && rolePermissions[role]) {
      if (role === 'admin') {
        const allRoutes = Object.keys(rolePermissions).map((key) => rolePermissions[key]).flat();
        setActiveRoutes(
          allRoutes.map((route) => ({
            path: route.path,
            element: route.component,
          })))
      } else {

        setActiveRoutes(
          rolePermissions[role].map((route) => ({
            path: route.path,
            element: route.component,
          })))
      }
    }
    else {
      setActiveRoutes([]);
    }
  };

  useEffect(() => {generateRoutes(role);}, [])
  const routes = useRoutes([...activeRoutes]);
  return routes;
}

export default App;
