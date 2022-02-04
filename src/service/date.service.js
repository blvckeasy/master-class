/**
 * date format function
 */
export function generateDatabaseDateTime() {
  return new Date(Date.now() + 5 * 60 * 60 * 1000).toLocaleString()
}
