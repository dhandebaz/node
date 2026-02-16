export enum ErrorCode {
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    CONFLICT = "CONFLICT",
    BAD_REQUEST = "BAD_REQUEST",
}

export class AppError extends Error {
    public code: ErrorCode;
    public statusCode: number;
    public details?: any;

    constructor(code: ErrorCode, message: string, details?: any) {
        super(message);
        this.name = "AppError";
        this.code = code;
        this.details = details;
        this.statusCode = this.getStatusCode(code);
    }

    private getStatusCode(code: ErrorCode): number {
        switch (code) {
            case ErrorCode.BAD_REQUEST:
            case ErrorCode.VALIDATION_ERROR:
                return 400;
            case ErrorCode.UNAUTHORIZED:
                return 401;
            case ErrorCode.FORBIDDEN:
                return 403;
            case ErrorCode.NOT_FOUND:
                return 404;
            case ErrorCode.CONFLICT:
                return 409;
            default:
                return 500;
        }
    }

    public toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                details: this.details,
            },
        };
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(ErrorCode.VALIDATION_ERROR, message, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(ErrorCode.UNAUTHORIZED, message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(ErrorCode.FORBIDDEN, message);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(ErrorCode.NOT_FOUND, `${resource} not found`);
    }
}
