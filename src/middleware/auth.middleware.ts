import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repositories';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: string;
            };
        }
    }
}

// Authentication middleware - verifies JWT token
export const authenticateToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

        // Verify user still exists in database
        const user = await UserRepository.getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        // Add user info to request object
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error: any) {
        console.error('Authentication error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        return res.status(500).json({ message: 'Authentication failed' });
    }
};

// Authorization middleware - checks if user has required role
export const authorizeRole = (...allowedRoles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

// Combined middleware for admin-only routes
export const requireAdmin = [authenticateToken, authorizeRole('admin')];

// Combined middleware for authenticated users (any role)
export const requireAuth = [authenticateToken];

// Optional authentication - doesn't fail if no token, but adds user info if present
export const optionalAuth = async (req: any, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

            const user = await UserRepository.getUserById(decoded.userId);
            if (user) {
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    role: decoded.role
                };
            }
        }

        next();
    } catch (error) {
        // For optional auth, we don't fail on errors - just continue without user info
        console.log('Optional auth failed, continuing without user context');
        next();
    }
};