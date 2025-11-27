export enum ErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    DATABASE_ERROR = 'DATABASE_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export class AppError extends Error {
    public type: ErrorType;
    public statusCode: number;
    public mitigation?: string;

    constructor(type: ErrorType, message: string, mitigation?: string) {
        super(message);
        this.type = type;
        this.statusCode = this.getStatusCode(type);
        this.mitigation = mitigation;
        this.name = 'AppError';
    }

    private getStatusCode(type: ErrorType): number {
        switch (type) {
            case ErrorType.VALIDATION_ERROR:
                return 400;
            case ErrorType.NOT_FOUND:
                return 404;
            case ErrorType.CONFLICT:
                return 409;
            case ErrorType.UNAUTHORIZED:
                return 401;
            case ErrorType.FORBIDDEN:
                return 403;
            case ErrorType.DATABASE_ERROR:
                return 503;
            case ErrorType.INTERNAL_ERROR:
            default:
                return 500;
        }
    }
}

export const handleControllerError = (error: any, res: any) => {
    console.error('Controller error:', error);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            error: {
                type: error.type,
                message: error.message,
                mitigation: error.mitigation
            }
        });
    }

    // Handle database-specific errors
    if (error.code) {
        switch (error.code) {
            case 'ETIMEDOUT':
            case 'ECONNREFUSED':
                return res.status(503).json({
                    error: {
                        type: ErrorType.DATABASE_ERROR,
                        message: 'Database connection failed',
                        mitigation: 'Check database server status and network connectivity'
                    }
                });
            case 'EREQUEST':
                return res.status(503).json({
                    error: {
                        type: ErrorType.DATABASE_ERROR,
                        message: 'Database query failed',
                        mitigation: 'Check database query syntax and table structure'
                    }
                });
        }
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: {
                type: ErrorType.UNAUTHORIZED,
                message: 'Invalid authentication token',
                mitigation: 'Please login again to obtain a valid token'
            }
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: {
                type: ErrorType.UNAUTHORIZED,
                message: 'Authentication token has expired',
                mitigation: 'Please login again to refresh your token'
            }
        });
    }

    // Default internal server error
    return res.status(500).json({
        error: {
            type: ErrorType.INTERNAL_ERROR,
            message: 'An unexpected error occurred',
            mitigation: 'Please try again later or contact support if the problem persists'
        }
    });
};