// import Signup from '../../Authorization/Seller/Signup';

import ErrorPage from "../../pages/ErrorPage";
import Dashboard from "../../pages/security/Dashboard";
import Inbox from "../../pages/security/Inbox";
import Login from "../../pages/security/Login";
import Profile from "../../pages/security/Profile";
import Settings from "../../pages/security/Settings";
import Shift from "../../pages/security/Shift";
import Signup from "../../pages/security/Signup";
import Video from "../../pages/security/Video";

export let security_route = [
    { path:'/signup', component: <Signup /> },
    { path:'/login', component: <Login /> },
    { path:'/', component: <Dashboard /> },
    { path:'/video', component: <Video /> },
    { path:'/inbox', component: <Inbox /> },
    { path:'/settings', component: <Settings /> },
    { path:'/profile', component: <Profile /> },
    { path:'/shift', component: <Shift /> },
    // { path:'/security/dashboard', component: <Signup /> },
    
    {path: "*", component: <ErrorPage />}
]