// js/main.js
console.log("main.js loaded");

// Startup sequence
initData();
renderTodayView();

// Request persistent storage once. Browsers may grant or refuse silently.
navigator.storage?.persist?.();

// Wire the "Add Goal" button
document.getElementById("addGoalBtn").addEventListener("click", function() {
    const input = document.getElementById("goalTitleInput");
    const result = createGoal(input.value);

    if (!result.success) {
        alert(result.error);
        return;
    }

    input.value = "";
    renderGoalList();
});

// Wire the "Back to goals" button
document.getElementById("backToGoalsBtn").addEventListener("click", function() {
    backToGoalList();
});

// Wire the "Add Task" button
document.getElementById("addTaskBtn").addEventListener("click", function() {
    if (!currentGoalId) return;

    const title = document.getElementById("newTaskTitle").value;
    const description = document.getElementById("newTaskDescription").value;
    const date = document.getElementById("newTaskDate").value || null;

    let result;
    if (editingBlockId) {
        result = updateBlock(editingBlockId, {
            title: title,
            description: description,
            assignedDate: date
        });
    } else {
        result = createBlock(currentGoalId, title, description, date);
    }

    if (!result.success) {
        alert(result.error);
        return;
    }

    editingBlockId = null;
    resetTaskForm();
    renderGoalDetail();
});

document.getElementById("cancelEditBtn").addEventListener("click", function() {
    editingBlockId = null;
    resetTaskForm();
});

// Wire "See all goals" from Today's View
document.getElementById("seeAllGoalsLink").addEventListener("click", function(e) {
    e.preventDefault();
    renderGoalList();
    showView("goalsListView");
});

// Wire "Settings" link on Today's View
document.getElementById("settingsLink").addEventListener("click", function(e) {
    e.preventDefault();
    showView("settingsView");
});

// Wire "← Today's View" from Settings
document.getElementById("backFromSettingsLink").addEventListener("click", function(e) {
    e.preventDefault();
    renderTodayView();
    showView("todayView");
});

// Wire "Export backup" button
document.getElementById("exportBtn").addEventListener("click", function() {
    const bundle = exportAll(getData());
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "study-planner-backup-" + getTodayString() + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
});

// Wire "Import backup" file input
document.getElementById("importFileInput").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;

    file.text().then(function(text) {
        const parsed = parseBackup(text);
        if (!parsed.success) {
            alert(parsed.error);
            e.target.value = "";
            return;
        }

        const preview = previewImport(parsed, getData());
        const dateStr = formatIsoDateForDisplay(preview.exportedAt);

        let msg = "This replaces your " + preview.currentGoals + " goals and " +
                  preview.currentBlocks + " tasks with " + preview.incomingGoals +
                  " goals and " + preview.incomingBlocks + " tasks from the backup dated " +
                  dateStr + ".";
        if (preview.droppedGoals > 0 || preview.droppedBlocks > 0) {
            msg += "\n\nSkipped: " + preview.droppedGoals + " goals, " +
                   preview.droppedBlocks + " tasks (invalid records).";
        }

        if (!confirm(msg)) {
            e.target.value = "";
            return;
        }

        const result = applyImport(parsed.data);
        if (!result.success) {
            alert(result.error);
            e.target.value = "";
            return;
        }

        currentGoalId = null;
        editingBlockId = null;
        renderTodayView();
        showView("todayView");
        e.target.value = "";
    }).catch(function(err) {
        alert("Could not read the file: " + err.message);
        e.target.value = "";
    });
});

// Wire "← Today's View" from the goals list
document.getElementById("backToTodayLink").addEventListener("click", function(e) {
    e.preventDefault();
    renderTodayView();
    showView("todayView");
});