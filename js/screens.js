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
        empty.className = "muted";
        container.appendChild(empty);
        return;
    }

    goals.forEach(function(goal) {
        const row = document.createElement("div");
        row.className = "goal-row";

        const title = document.createElement("span");
        title.textContent = goal.title;
        title.className = "goal-title";
        title.addEventListener("click", function() {
            openGoalDetail(goal.id);
        });
        row.appendChild(title);

        const rightSide = document.createElement("div");
        rightSide.className = "goal-actions";

        const progress = getGoalProgress(getData(), goal.id);
        const progressEl = document.createElement("span");
        progressEl.textContent = progress.total === 0 ? "No tasks" : progress.percent + "%";
        progressEl.className = "muted";
        rightSide.appendChild(progressEl);

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "8px";

        const renameBtn = document.createElement("button");
        renameBtn.textContent = "Rename";
        renameBtn.className = "action-btn";
        renameBtn.addEventListener("click", function() {
            const newTitle = prompt("New goal title:", goal.title);
            if (newTitle === null) return;
            const result = updateGoal(goal.id, newTitle);
            if (!result.success) { alert(result.error); return; }
            renderGoalList();
        });
        actions.appendChild(renameBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "action-btn danger";
        deleteBtn.addEventListener("click", function() {
            const blocksCount = getBlocksForGoal(getData(), goal.id).length;
            const msg = "Delete " + goal.title + " and its " + blocksCount + " tasks?";
            if (!confirm(msg)) return;
            let result = deleteGoal(goal.id);
            
            // If snapshot failed, ask for override
            if (!result.success && result.snapshotFailed) {
                if (confirm("Couldn't create a safety copy. Delete anyway?")) {
                    result = deleteGoal(goal.id, true); // force delete
                } else {
                    return; // user cancelled
                }
            }

            if (!result.success) { alert(result.error); return; }
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

// --- Goal Detail View ---

function renderGoalDetail() {
    const goal = getData().goals.find(function(g) { return g.id === currentGoalId; });

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
        empty.className = "muted";
        container.appendChild(empty);
        return;
    }

    blocks.forEach(function(block) {
        const row = document.createElement("div");
        row.className = "row";
        row.style.alignItems = "flex-start"; // Aligns checkbox to top if description is long

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = block.isCompleted;
        checkbox.addEventListener("change", function() {
            const result = toggleBlockComplete(block.id);
            if (!result.success) { alert(result.error); return; }
            renderGoalDetail();
        });
        row.appendChild(checkbox);

        const textDiv = document.createElement("div");
        textDiv.className = "task-text";

        const titleEl = document.createElement("div");
        titleEl.textContent = block.title;
        if (block.isCompleted) titleEl.className = "task-done";
        textDiv.appendChild(titleEl);

        if (block.description) {
            const descEl = document.createElement("div");
            descEl.textContent = block.description;
            descEl.className = "muted";
            if (block.isCompleted) descEl.classList.add("task-done");
            textDiv.appendChild(descEl);
        }

        const dateEl = document.createElement("div");
        dateEl.textContent = block.assignedDate ? formatDateForDisplay(block.assignedDate) : "Unscheduled";
        dateEl.className = "muted";
        dateEl.style.fontSize = "0.8em";
        dateEl.style.marginTop = "4px";
        textDiv.appendChild(dateEl);

        row.appendChild(textDiv);

        // Action buttons container
        const actionDiv = document.createElement("div");
        actionDiv.style.display = "flex";
        actionDiv.style.gap = "4px";

        const upBtn = document.createElement("button");
        upBtn.textContent = "↑";
        upBtn.className = "action-btn";
        upBtn.title = "Move up";
        upBtn.addEventListener("click", function() {
            const result = reorderBlock(block.id, "up");
            if (!result.success) { alert(result.error); return; }
            renderGoalDetail();
        });
        actionDiv.appendChild(upBtn);

        const downBtn = document.createElement("button");
        downBtn.textContent = "↓";
        downBtn.className = "action-btn";
        downBtn.title = "Move down";
        downBtn.addEventListener("click", function() {
            const result = reorderBlock(block.id, "down");
            if (!result.success) { alert(result.error); return; }
            renderGoalDetail();
        });
        actionDiv.appendChild(downBtn);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "action-btn";
        editBtn.addEventListener("click", function() {
            editingBlockId = block.id;
            document.getElementById("newTaskTitle").value = block.title;
            document.getElementById("newTaskDescription").value = block.description || "";
            document.getElementById("newTaskDate").value = block.assignedDate || "";
            document.getElementById("addTaskBtn").textContent = "Save Changes";
            document.getElementById("cancelEditBtn").style.display = "inline-block";
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        });
        actionDiv.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "action-btn danger";
        deleteBtn.addEventListener("click", function() {
            if (!confirm("Delete this task?")) return;
            const result = deleteBlock(block.id);
            if (!result.success) { alert(result.error); return; }
            renderGoalDetail();
        });
        actionDiv.appendChild(deleteBtn);

        row.appendChild(actionDiv);
        container.appendChild(row);
    });
}

// --- Today's View ---

function renderTodayView() {
    document.getElementById("todayDate").textContent = formatDateForDisplay(getTodayString());

    document.getElementById("quickAddForm").style.display = "none";

    const container = document.getElementById("todayTaskList");
    container.innerHTML = "";

    // First-run banner
    const meta = loadMeta();
    if (!meta.firstRunDismissed) {
        const banner = document.createElement("div");
        banner.className = "banner";

        const bannerText = document.createElement("div");
        bannerText.textContent = "Your data is saved on this device only. Back it up from Settings.";
        bannerText.className = "muted";
        banner.appendChild(bannerText);

        const dismissBtn = document.createElement("button");
        dismissBtn.textContent = "×";
        dismissBtn.title = "Dismiss";
        dismissBtn.style.cssText = "background:none; border:none; color:#ccc; cursor:pointer; font-size:1.3em; padding:0 4px; line-height:1;";
        dismissBtn.addEventListener("click", function() {
            const m = loadMeta();
            m.firstRunDismissed = true;
            saveMeta(m);
            renderTodayView();
        });
        banner.appendChild(dismissBtn);

        container.appendChild(banner);
    }

    // Backup reminder
    const todayStr = getTodayString();
    let showBackupReminder = false;
    const hasData = getData().blocks.length >= 5;

    // Don't show if first-run banner is showing, or user dismissed it today, or no data yet
    if (meta.firstRunDismissed && meta.reminderDismissedUntil !== todayStr && hasData) {
        if (!meta.lastBackupAt) {
            showBackupReminder = true;
        } else {
            const last = new Date(meta.lastBackupAt);
            const diffDays = (new Date() - last) / (1000 * 60 * 60 * 24);
            if (diffDays >= 7) {
                showBackupReminder = true;
            }
        }
    }

    if (showBackupReminder) {
        const reminder = document.createElement("div");
        reminder.className = "banner banner-warning";

        const reminderText = document.createElement("div");
        reminderText.textContent = "It's been a while since your last backup. Go to Settings to export your data.";
        reminder.appendChild(reminderText);

        const dismissBtn = document.createElement("button");
        dismissBtn.textContent = "×";
        dismissBtn.style.cssText = "background:none; border:none; color:#fff; cursor:pointer; font-size:1.3em; padding:0 4px; line-height:1;";
        dismissBtn.addEventListener("click", function() {
            const m = loadMeta();
            m.reminderDismissedUntil = todayStr;
            saveMeta(m);
            renderTodayView();
        });
        reminder.appendChild(dismissBtn);

        container.appendChild(reminder);
    }

    const data = getData();
    const grouped = getTodayBlocks(data);

    // Empty state 1: no goals at all
    if (data.goals.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No goals yet. Create your first goal to get started.";
        empty.className = "muted";
        container.appendChild(empty);

        const createBtn = document.createElement("button");
        createBtn.textContent = "+ Create your first goal";
        createBtn.className = "btn-primary";
        createBtn.style.marginTop = "16px";
        createBtn.addEventListener("click", function() {
            renderGoalList();
            showView("goalsListView");
            setTimeout(function() {
                document.getElementById("goalTitleInput").focus();
            }, 50);
        });
        container.appendChild(createBtn);
        return;
    }

    // Missed section
    const missed = getMissedBlocks(data);
    if (missed.length > 0) {
        const missedHeader = document.createElement("div");
        missedHeader.className = "banner";
        missedHeader.style.cursor = "pointer";

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
                row.className = "missed-row";

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
                textDiv.className = "task-text";

                const titleEl = document.createElement("div");
                titleEl.textContent = block.title;
                textDiv.appendChild(titleEl);

                const metaEl = document.createElement("div");
                metaEl.textContent = goalName + " · " + formatDateForDisplay(block.assignedDate);
                metaEl.className = "muted";
                textDiv.appendChild(metaEl);

                row.appendChild(textDiv);

                const moveBtn = document.createElement("button");
                moveBtn.textContent = "Move to today";
                moveBtn.style.padding = "4px 8px";
                moveBtn.style.fontSize = "0.8em";
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
        empty.className = "muted";
        container.appendChild(empty);
    }

    // Normal state: task list grouped by goal
    grouped.forEach(function(group) {
        const header = document.createElement("h3");
        header.textContent = group.goal.title;
        header.style.marginTop = "24px";
        header.style.marginBottom = "8px";
        container.appendChild(header);

        group.blocks.forEach(function(block) {
            const row = document.createElement("div");
            row.className = "row";

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
            textDiv.className = "task-text";

            const titleEl = document.createElement("div");
            titleEl.textContent = block.title;
            if (block.isCompleted) titleEl.className = "task-done";
            textDiv.appendChild(titleEl);

            if (block.description) {
                const descEl = document.createElement("div");
                descEl.textContent = block.description;
                descEl.className = "muted";
                if (block.isCompleted) descEl.classList.add("task-done");
                textDiv.appendChild(descEl);
            }

            row.appendChild(textDiv);
            container.appendChild(row);
        });
    });
}