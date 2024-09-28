import { User } from '../entities';
import { JWTToken } from '../middleware/auth.middleware';

declare global {
    namespace Express {
        interface Request {
            token: JWTToken | null;
            user: User | null;
        }
    }
}
