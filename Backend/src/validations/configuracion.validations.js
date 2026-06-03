import { body } from 'express-validator'

const FRECUENCIAS_VALIDAS = ['diario', 'semanal', 'mensual']
const FORMATOS_VALIDOS = ['pdf', 'excel', 'csv']
const CANALES_VALIDOS = ['correo', 'sms', 'push']

export const guardarSchema = [
    body().isObject().withMessage('Datos invalidos.'),

    body('reportes.tipo')
        .optional()
        .isArray().withMessage('El campo "tipo" de reportes debe ser un arreglo.'),
    body('reportes.tipo.*')
        .optional()
        .isString().withMessage('Cada tipo de reporte debe ser texto.'),
    body('reportes.frecuencia')
        .optional()
        .isIn(FRECUENCIAS_VALIDAS)
        .withMessage(`Frecuencia de reportes invalida. Valores permitidos: ${FRECUENCIAS_VALIDAS.join(', ')}.`),
    body('reportes.formato')
        .optional()
        .isIn(FORMATOS_VALIDOS)
        .withMessage(`Formato de reportes invalido. Valores permitidos: ${FORMATOS_VALIDOS.join(', ')}.`),

    body('notificaciones.canales')
        .optional()
        .isArray().withMessage('El campo "canales" de notificaciones debe ser un arreglo.'),
    body('notificaciones.canales.*')
        .optional()
        .isIn(CANALES_VALIDOS)
        .withMessage(`Canal de notificacion invalido. Valores permitidos: ${CANALES_VALIDOS.join(', ')}.`),
    body('notificaciones.frecuencia')
        .optional()
        .isIn(FRECUENCIAS_VALIDAS)
        .withMessage(`Frecuencia de notificaciones invalida. Valores permitidos: ${FRECUENCIAS_VALIDAS.join(', ')}.`)
]
