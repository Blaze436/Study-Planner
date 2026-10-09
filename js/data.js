// js/data.js
console.log("data.js loaded");

// The single in-memory source of truth for the whole app.
let plannerData = null;

// Generates a unique ID like "goal_abc123..." with a fallback for old browsers.
function generateId(prefix) {
    const uuid = crypto.randomUUID?.() ?? 
                 `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return `${prefix}_${uuid}`;
}

// Called once on startup. Loads from storage into memory.
function initData() {
    plannerData = loadAll();
    return plannerData;
}

// Returns the current in-memory data. Screens read from this.
function getData() {
    return plannerData;
}

// Creates a new goal, saves, returns { success, data } or { success, error }.
function createGoal(title) {
    const trimmed = (title || "").trim();
    if (trimmed === "") {
        return { success: false, error: "Goal title cannot be empty." };
    }

    const newGoal = {
        id: generateId("goal"),
        title: trimmed,
        createdAt: new Date().toISOString()
    };

    plannerData.goals.push(newGoal);
    saveAll(plannerData);
    return { success: true, data: newGoal };
}

// Returns all goals sorted by createdAt (oldest first).
function getAllGoalsSorted(data) {
    return [...data.goals].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
