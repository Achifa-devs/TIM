// import Signup from '../../Authorization/Seller/Signup';

import ErrorPage from "../../pages/ErrorPage";
import Dashboard from "../../pages/admin/Dashboard";
import Login from "../../pages/admin/Login";
import Shift from "../../pages/admin/Shift";
import Signup from "../../pages/admin/Signup";
import Users from "../../pages/admin/User";

export let admin_route = [
    { path:'/admin/signup', component: <Signup /> },
    { path:'/admin/login', component: <Login /> },
    { path:'/admin/', component: <Dashboard /> },
    { path:'/admin/users', component: <Users /> },
    { path:'/admin/shift', component: <Shift /> },
    
    {path: "*", component: <ErrorPage />}
] 