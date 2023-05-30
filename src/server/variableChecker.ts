export function isNotNullUndefinedOrEmpty(obj: object | null | undefined): boolean {
    if (obj === null || obj === undefined) {
        return false
    }

    if (typeof obj === 'object' && Object.keys(obj).length === 0) {
        return false
    }

    return true
}

export function isValidDate(d: Date) {
    return d instanceof Date && !isNaN(Number(d))
}
