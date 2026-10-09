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

console.log("Today:", getTodayString());
console.log("Formatted Date:", formatDateForDisplay(getTodayString()));