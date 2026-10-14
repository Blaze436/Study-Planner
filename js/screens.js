// js/screens.js
console.log("screens.js loaded");

// Which goal's detail view is currently open (null = list view)
let currentGoalId = null;

// Which block is currently being edited (null = adding new)
let editingBlockId = null;

// Whether the Missed section is expanded (null = collapse state preserved across re-renders)
let missedOpen = false;

// Shows one view, hides all others.
function showView(viewId) {
    document.getElementById("todayView").style.display = "none";
    document.getElementById("goalsListView").style.display = "none";
    document.getElementById("goalDetailView").style.display = "none";
    document.getElementById("settingsView").style.display = "none";
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

        const rightSide = document.createElement("div");
        rightSide.style.display = "flex";
        rightSide.style.alignItems = "center";

        const progress = getGoalProgress(getData(), goal.id);
        const progressEl = document.createElement("span");
        if (progress.total === 0) {
            progressEl.textContent = "No tasks yet";
        } else {
            progressEl.textContent = progress.percent + "% done";
        }
        progressEl.style.color = "#888";
        progressEl.style.marginRight = "12px";
        progressEl.style.fontSize = "0.85em";
        rightSide.appendChild(progressEl);

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

        rightSide.appendChild(actions);
        row.appendChild(rightSide);
        container.appendChild(row);
    });
}

// --- Goal Detail View ---

function openGoalDetail(goalId) {
    currentGoalId = goalId;
    editingBlockId = null;
    resetTaskForm();
    renderGoalDetail();
    showView("goalDetailView");
}

function resetTaskForm() {
    document.getElementById("newTaskTitle").value = "";
    document.getElementById("newTaskDescription").value = "";
    document.getElementById("newTaskDate").value = "";
    document.getElementById("addTaskBtn").textContent = "Add Task";
    document.getElementById("cancelEditBtn").style.display = "none";
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

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.cssText = "background:none; border:1px solid #666; color:#aaa; padding:2px 8px; cursor:pointer; font-size:0.8em; border-radius:4px; margin-right:4px;";
        editBtn.addEventListener("click", function() {
            editingBlockId = block.id;
            document.getElementById("newTaskTitle").value = block.title;
            document.getElementById("newTaskDescription").value = block.description || "";
            document.getElementById("newTaskDate").value = block.assignedDate || "";
            document.getElementById("addTaskBtn").textContent = "Save Changes";
            document.getElementById("cancelEditBtn").style.display = "inline-block";
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        });
        row.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.cssText = "background:none; border:1px solid #666; color:#aaa; padding:2px 8px; cursor:pointer; font-size:0.8em; border-radius:4px;";
        deleteBtn.addEventListener("click", function() {
            if (!confirm("Delete this task?")) return;
            const result = deleteBlock(block.id);
            if (!result.success) {
                alert(result.error);
                return;
            }
            renderGoalDetail();
        });
        row.appendChild(deleteBtn);

        container.appendChild(row);
    });
}

// --- Today's View ---

function renderTodayView() {
    document.getElementById("todayDate").textContent = formatDateForDisplay(getTodayString());

    const container = document.getElementById("todayTaskList");
    container.innerHTML = "";

    const data = getData();
    const grouped = getTodayBlocks(data);

    // Empty state 1: no goals at all
    if (data.goals.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No goals yet. Create your first goal to get started.";
        empty.style.color = "#888";
        container.appendChild(empty);

        const createBtn = document.createElement("button");
        createBtn.textContent = "+ Create your first goal";
        createBtn.style.cssText = "margin-top:16px; padding:10px 16px; background:#4a5568; color:white; border:none; border-radius:6px; cursor:pointer; font-size:1em;";
        createBtn.addEventListener("click", function() {
            renderGoalList();
            showView("goalsListView");
            // Focus the input
            setTimeout(function() {
                document.getElementById("goalTitleInput").focus();
            }, 50);
        });
        container.appendChild(createBtn);
        return;
    }

    // Missed section (only if there are any missed blocks)
    const missed = getMissedBlocks(data);
    if (missed.length > 0) {
        const missedHeader = document.createElement("div");
        missedHeader.style.padding = "10px";
        missedHeader.style.background = "#1e3a5f";
        missedHeader.style.border = "1px solid #2c5282";
        missedHeader.style.borderRadius = "6px";
        missedHeader.style.marginBottom = "10px";
        missedHeader.style.cursor = "pointer";
        missedHeader.style.display = "flex";
        missedHeader.style.justifyContent = "space-between";
        missedHeader.style.alignItems = "center";

        const missedLabel = document.createElement("span");
        missedLabel.textContent = "Missed (" + missed.length + ")";
        missedLabel.style.fontWeight = "bold";
        missedHeader.appendChild(missedLabel);

        const chevron = document.createElement("span");
        chevron.textContent = missedOpen ? "▲" : "▼";
        missedHeader.appendChild(chevron);

        missedHeader.addEventListener("click", function() {
            missedOpen = !missedOpen;
            renderTodayView();
        });
        container.appendChild(missedHeader);

        if (missedOpen) {
            missed.forEach(function(block) {
                const goal = data.goals.find(function(g) { return g.id === block.goalId; });
                const goalName = goal ? goal.title : "(deleted goal)";

                const row = document.createElement("div");
                row.style.padding = "8px 10px";
                row.style.marginBottom = "4px";
                row.style.background = "#252a33";
                row.style.border = "1px solid #3a3f4a";
                row.style.borderRadius = "4px";
                row.style.display = "flex";
                row.style.alignItems = "center";
                row.style.gap = "10px";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = false;
                checkbox.addEventListener("change", function() {
                    const result = toggleBlockComplete(block.id);
                    if (!result.success) { alert(result.error); return; }
                    renderTodayView();
                });
                row.appendChild(checkbox);

                const textDiv = document.createElement("div");
                textDiv.style.flex = "1";

                const titleEl = document.createElement("div");
                titleEl.textContent = block.title;
                textDiv.appendChild(titleEl);

                const metaEl = document.createElement("div");
                metaEl.textContent = goalName + " · " + formatDateForDisplay(block.assignedDate);
                metaEl.style.fontSize = "0.8em";
                metaEl.style.color = "#888";
                textDiv.appendChild(metaEl);

                row.appendChild(textDiv);

                const moveBtn = document.createElement("button");
                moveBtn.textContent = "Move to today";
                moveBtn.style.cssText = "background:none; border:1px solid #666; color:#aaa; padding:3px 8px; cursor:pointer; font-size:0.75em; border-radius:4px;";
                moveBtn.addEventListener("click", function() {
                    const result = updateBlock(block.id, { assignedDate: getTodayString() });
                    if (!result.success) { alert(result.error); return; }
                    renderTodayView();
                });
                row.appendChild(moveBtn);

                container.appendChild(row);
            });
        }
    }

    // Empty state 2: goals exist, nothing today
    if (grouped.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No tasks today.";
        empty.style.color = "#888";
        container.appendChild(empty);
    }

    // Normal state: task list grouped by goal
    grouped.forEach(function(group) {
        const header = document.createElement("h3");
        header.textContent = group.goal.title;
        header.style.marginTop = "20px";
        header.style.marginBottom = "8px";
        container.appendChild(header);

        group.blocks.forEach(function(block) {
            const row = document.createElement("div");
            row.style.padding = "8px 0";
            row.style.borderBottom = "1px solid #333";
            row.style.display = "flex";
            row.style.alignItems = "flex-start";
            row.style.gap = "10px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = block.isCompleted;
            checkbox.addEventListener("change", function() {
                const result = toggleBlockComplete(block.id);
                if (!result.success) { alert(result.error); return; }
                renderTodayView();
            });
            row.appendChild(checkbox);

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
                textDiv.appendChild(descEl);
            }

            row.appendChild(textDiv);
            container.appendChild(row);
        });
    });
}