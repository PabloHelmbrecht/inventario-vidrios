function convertFloat(value: number): string {
    if (Number.isInteger(value)) {
        return value.toString()
    } else {
        return value.toFixed(2)
    }
}
export default convertFloat
