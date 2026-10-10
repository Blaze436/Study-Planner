// js/screens.js
console.log("screens.js loaded");

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
        row.style.padding = "8px";
        row.style.borderBottom = "1px solid #333";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";

        const title = document.createElement("span");
        title.textContent = goal.title;
        row.appendChild(title);

        const actions = document.createElement("div");

        const renameBtn = document.createElement("button");
        renameBtn.textContent = "Rename";
        renameBtn.style.marginRight = "8px";
        renameBtn.addEventListener("click", function() {
            const newTitle = prompt("New goal title:", goal.title);
            if (newTitle === null) return; // cancelled
            const result = updateGoal(goal.id, newTitle);
            if (!result.success) {
                alert(result.error);
                return;
            }
            renderGoalList();
        });
        actions.appendChild(renameBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", function() {
            const blocksCount = getBlocksForGoal(getData(), goal.id).length;
            const msg = "Delete " + goal.title + " and its " + blocksCount + " tasks?";
            if (!confirm(msg)) return;
            const result = deleteGoal(goal.id);
            if (!result.success) {
                alert(result.error);
                return;
            }
            renderGoalList();
        });
        actions.appendChild(deleteBtn);

        row.appendChild(actions);
        container.appendChild(row);
    });
}