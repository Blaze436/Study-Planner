// js/date.js
console.log("date.js loaded");

// Returns today's date as "YYYY-MM-DD" in LOCAL time (never UTC).
function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Formats "2026-10-09" as "Oct 9, 2026". Returns "—" for null.
function formatDateForDisplay(dateStr) {
    if (!dateStr) return "—";
    const [year, month, day] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

function isValidDateString(dateStr) {
    if (typeof dateStr !== "string") return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

// Converts an ISO datetime string to "Oct 14, 2026" in LOCAL time.
// Never slice the ISO string — that's UTC and can be off by one day.
function formatIsoDateForDisplay(isoString) {
    if (!isoString) return "unknown date";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "unknown date";
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[month - 1]} ${day}, ${year}`;
}