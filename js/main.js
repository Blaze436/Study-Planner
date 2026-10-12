// js/main.js
console.log("main.js loaded");

// Startup sequence
initData();
renderGoalList();

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