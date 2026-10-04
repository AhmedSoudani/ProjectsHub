export function formatDate(value) {
    // A bare "YYYY-MM-DD" is parsed as UTC; read it as a local date so it doesn't shift a day.
    const date = new Date(value.length === 10 ? `${value}T00:00` : value);
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
