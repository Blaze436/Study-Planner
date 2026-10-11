// js/screens.js
console.log("screens.js loaded");

// Which goal's detail view is currently open (null = list view)
let currentGoalId = null;

// Shows one view, hides all others.
function showView(viewId) {
    document.getElementById("goalsListView").style.display = "none";
    document.getElementById("goalDetailView").style.display = "none";
    document.getElementById(viewId).style.display = "block";
}

// --- Goals List View ---

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

        // Clickable title opens the detail view
        const title = document.createElement("span");
        title.textContent = goal.title;
        title.style.cursor = "pointer";
        title.style.textDecoration = "underline";
        title.addEventListener("click", function() {
            openGoalDetail(goal.id);
        });
        row.appendChild(title);

        const actions = document.createElement("div");

        const renameBtn = document.createElement("button");
        renameBtn.textContent = "Rename";
        renameBtn.style.marginRight = "8px";
        renameBtn.addEventListener("click", function() {
            const newTitle = prompt("New goal title:", goal.title);
            if (newTitle === null) return;
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

// --- Goal Detail View ---

function openGoalDetail(goalId) {
    currentGoalId = goalId;
    renderGoalDetail();
    showView("goalDetailView");
}

function backToGoalList() {
    currentGoalId = null;
    renderGoalList();
    showView("goalsListView");
}

function renderGoalDetail() {
    const goal = getData().goals.find(function(g) { return g.id === currentGoalId; });

    // Goal disappeared (deleted elsewhere) — go back to the list
    if (!goal) {
        backToGoalList();
        return;
    }

    document.getElementById("goalDetailTitle").textContent = goal.title;

    const container = document.getElementById("goalTaskList");
    container.innerHTML = "";

    const blocks = getBlocksForGoal(getData(), currentGoalId);

    if (blocks.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No tasks yet. Add one below.";
        empty.style.color = "#888";
        container.appendChild(empty);
        return;
    }

    blocks.forEach(function(block) {
        const row = document.createElement("div");
        row.style.padding = "8px 0";
        row.style.borderBottom = "1px solid #333";
        row.style.display = "flex";
        row.style.alignItems = "flex-start";
        row.style.gap = "10px";

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = block.isCompleted;
        checkbox.addEventListener("change", function() {
            const result = toggleBlockComplete(block.id);
            if (!result.success) {
                alert(result.error);
                return;
            }
            renderGoalDetail();
        });
        row.appendChild(checkbox);

        // Text block
        const textDiv = document.createElement("div");
        textDiv.style.flex = "1";

        const titleEl = document.createElement("div");
        titleEl.textContent = block.title;
        if (block.isCompleted) {
            titleEl.style.textDecoration = "line-through";
            titleEl.style.opacity = "0.6";
        }
        textDiv.appendChild(titleEl);

        if (block.description) {
            const descEl = document.createElement("div");
            descEl.textContent = block.description;
            descEl.style.fontSize = "0.85em";
            descEl.style.color = "#888";
            if (block.isCompleted) descEl.style.opacity = "0.6";
            textDiv.appendChild(descEl);
        }

        const dateEl = document.createElement("div");
        dateEl.textContent = block.assignedDate
            ? formatDateForDisplay(block.assignedDate)
            : "Unscheduled";
        dateEl.style.fontSize = "0.8em";
        dateEl.style.color = "#666";
        textDiv.appendChild(dateEl);

        row.appendChild(textDiv);
        container.appendChild(row);
    });
}