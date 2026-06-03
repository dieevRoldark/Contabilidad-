import { validationResult } from 'express-validator'
import { AppError } from '../utils/AppError.js'

export function validate(schemas) {
    return async (req, res, next) => {
        await Promise.all(schemas.map(schema => schema.run(req)))

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json(new AppError(errors.array()[0].msg, 400, 'VALIDATION_ERROR').toJSON())
        }

        next()
    }
}
