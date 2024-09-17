
// import { buyer_route } from './routes/buyer_route';
import { admin_route } from './routes/admin_route';
import { security_route } from './routes/security_route';


const rolePermission = {
    security: security_route,
    admin: admin_route
}


export default rolePermission; 