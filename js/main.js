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

// Wire the "Add Task" button (only active when the detail view is open)
document.getElementById("addTaskBtn").addEventListener("click", function() {
    if (!currentGoalId) return;

    const title = document.getElementById("newTaskTitle").value;
    const description = document.getElementById("newTaskDescription").value;
    const date = document.getElementById("newTaskDate").value || null;

    const result = createBlock(currentGoalId, title, description, date);
    if (!result.success) {
        alert(result.error);
        return;
    }

    // Clear the form
    document.getElementById("newTaskTitle").value = "";
    document.getElementById("newTaskDescription").value = "";
    document.getElementById("newTaskDate").value = "";

    renderGoalDetail();
});