// js/screens.js
console.log("screens.js loaded");

// Renders the goal list into the #goalList container.
function renderGoalList() {
    const container = document.getElementById("goalList");
    if (!container) return;

    const data = getData();
    const goals = getAllGoalsSorted(data);

    container.innerHTML = "";

    if (goals.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No goals yet.";
        empty.style.color = "#888";
        container.appendChild(empty);
        return;
    }

    goals.forEach(function(goal) {
        const row = document.createElement("div");
        row.textContent = goal.title;
        row.style.padding = "8px";
        row.style.borderBottom = "1px solid #333";
        container.appendChild(row);
    });
}