// js/main.js
console.log("main.js loaded");

// Helper for older browsers that don't support file.text()
function readFileAsText(file) {
    if (typeof file.text === "function") {
        return file.text();
    }
    return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function(e) { resolve(e.target.result); };
        reader.onerror = function(e) { reject(e.target.error); };
        reader.readAsText(file);
    });
}

// Startup sequence
initData();
renderTodayView();

document.getElementById("addGoalBtn").addEventListener("click", function() {
    const input = document.getElementById("goalTitleInput");
    const result = createGoal(input.value);

    if (!result.success) {
        alert(result.error);
        return;
    }

    // Ask for persistent storage once the user has actually created data
    if (getData().goals.length === 1) {
        navigator.storage?.persist?.();
    }

    input.value = "";
    renderGoalList();
});

// Check for recovery data on load
const rawRecovery = getRecovery();
if (rawRecovery) {
    document.getElementById("recoverySection").style.display = "block";
}

// Wire download recovery
document.getElementById("downloadRecoveryBtn").addEventListener("click", function() {
    const blob = new Blob([rawRecovery], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "study-planner-recovery-" + getTodayString() + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    updateSnapshotInfo();
    showView("settingsView");
});

// Wire "← Today's View" from Settings
document.getElementById("backFromSettingsLink").addEventListener("click", function(e) {
    e.preventDefault();
    renderTodayView();
    showView("todayView");
});

// Builds a JSON string of the current data and triggers a download.
function downloadBackup() {
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

    const meta = loadMeta();
    meta.lastBackupAt = new Date().toISOString();
    saveMeta(meta);
}

// Wire "Export backup" button.
// On phones that support sharing files, opens the share sheet so the backup
// can go straight to WhatsApp / Drive / email. Otherwise, downloads the file.
document.getElementById("exportBtn").addEventListener("click", function() {
    const bundle = exportAll(getData());
    const json = JSON.stringify(bundle, null, 2);
    const filename = "study-planner-backup-" + getTodayString() + ".json";

    if (typeof navigator.canShare === "function" && typeof File === "function") {
        try {
            const file = new File([json], filename, { type: "application/json" });
            if (navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: "Study Planner backup"
                }).then(function() {
                    const meta = loadMeta();
                    meta.lastBackupAt = new Date().toISOString();
                    saveMeta(meta);
                }).catch(function(err) {
                    if (err && err.name === "AbortError") return;
                    downloadBackup();
                });
                return;
            }
        } catch (e) {
            // File construction or canShare threw — fall through to download
        }
    }

    downloadBackup();
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

// Quick-add task form on Today's View
const quickAddForm = document.getElementById("quickAddForm");

document.getElementById("quickAddBtn").addEventListener("click", function() {
    const data = getData();
    if (data.goals.length === 0) {
        alert("Create a goal first.");
        renderGoalList();
        showView("goalsListView");
        setTimeout(function() {
            document.getElementById("goalTitleInput").focus();
        }, 50);
        return;
    }

    // Populate goal picker
    const select = document.getElementById("quickAddGoal");
    select.innerHTML = "";
    getAllGoalsSorted(data).forEach(function(g) {
        const opt = document.createElement("option");
        opt.value = g.id;
        opt.textContent = g.title;
        select.appendChild(opt);
    });

    // Reset fields, default date to today
    document.getElementById("quickAddTitle").value = "";
    document.getElementById("quickAddDescription").value = "";
    document.getElementById("quickAddDate").value = getTodayString();

    quickAddForm.style.display = "block";
    document.getElementById("quickAddTitle").focus();
});

document.getElementById("quickAddCancel").addEventListener("click", function() {
    quickAddForm.style.display = "none";
});

document.getElementById("quickAddSave").addEventListener("click", function() {
    const goalId = document.getElementById("quickAddGoal").value;
    const title = document.getElementById("quickAddTitle").value;
    const description = document.getElementById("quickAddDescription").value;
    const date = document.getElementById("quickAddDate").value || null;

    const result = createBlock(goalId, title, description, date);
    if (!result.success) {
        alert(result.error);
        return;
    }

    quickAddForm.style.display = "none";
    renderTodayView();
});

// Updates the "snapshot info" text in Settings.
function updateSnapshotInfo() {
    const el = document.getElementById("snapshotInfo");
    const wrapper = getPrevSnapshot();
    if (!wrapper || !wrapper.savedAt || !wrapper.data) {
        el.textContent = "No snapshot available yet.";
        return;
    }
    const when = formatIsoDateForDisplay(wrapper.savedAt);
    const goalCount = (wrapper.data.goals || []).length;
    const blockCount = (wrapper.data.blocks || []).length;
    el.textContent = "Snapshot from " + when + ": " + goalCount + " goals, " + blockCount + " tasks.";
}

// Wire "Restore previous data" button
document.getElementById("restoreSnapshotBtn").addEventListener("click", function() {
    const wrapper = getPrevSnapshot();
    if (!wrapper || !wrapper.data) {
        alert("No snapshot to restore.");
        return;
    }

    const when = formatIsoDateForDisplay(wrapper.savedAt);
    const goalCount = (wrapper.data.goals || []).length;
    const blockCount = (wrapper.data.blocks || []).length;
    const current = getData();

    const msg = "This replaces your current " + current.goals.length + " goals and " +
                current.blocks.length + " tasks with the snapshot from " + when +
                " (" + goalCount + " goals, " + blockCount + " tasks).\n\nAnything you've added or changed since that snapshot will be lost.";
    if (!confirm(msg)) return;

    const result = restoreFromSnapshot();
    if (!result.success) {
        alert(result.error);
        return;
    }

    currentGoalId = null;
    editingBlockId = null;
    renderTodayView();
    showView("todayView");
});

// --- Cross-tab synchronization and midnight refresh ---

function handleExternalDataChange() {
    // Reload data from storage into memory
    initData();

    // 1. Check if the currently open goal was deleted in another tab
    if (currentGoalId && !getData().goals.find(function(g) { return g.id === currentGoalId; })) {
        currentGoalId = null;
    }

    // 2. Check if the task currently being edited was deleted in another tab
    if (editingBlockId && !getData().blocks.find(function(b) { return b.id === editingBlockId; })) {
        editingBlockId = null;
        resetTaskForm(); // from screens.js
    }

    // 3. Re-render whichever view is currently visible
    if (document.getElementById("todayView").style.display !== "none") {
        renderTodayView();
    } else if (document.getElementById("goalsListView").style.display !== "none") {
        renderGoalList();
    } else if (document.getElementById("goalDetailView").style.display !== "none") {
        if (currentGoalId) {
            renderGoalDetail();
        } else {
            backToGoalList();
        }
    } else if (document.getElementById("settingsView").style.display !== "none") {
        updateSnapshotInfo();
    }
}

// Listen for storage changes from OTHER tabs
window.addEventListener("storage", function(e) {
    // e.key is null when localStorage.clear() is called
    if (e.key === "studyPlanner" || e.key === null) {
        handleExternalDataChange();
    }
});

// Refresh when the user returns to the tab (fixes the "left open past midnight" issue)
document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible") {
        handleExternalDataChange();
    }
});