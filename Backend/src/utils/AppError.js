const CODIGOS = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
}

export class AppError extends Error {
    constructor(message, status = 500, codigo) {
        super(message)
        this.status = status
        this.codigo = codigo || CODIGOS[status] || 'UNKNOWN_ERROR'
    }

    toJSON() {
        return {
            error: true,
            codigo: this.codigo,
            detalles: this.message,
        }
    }
}
