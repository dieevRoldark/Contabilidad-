export const mysqlDatetime = (date = new Date()) =>
    date.toISOString().replace('T', ' ').slice(0, 19)
