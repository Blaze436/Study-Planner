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

// Verifies and cleans data per the schema. Pure — no storage, no DOM.
// Returns { data, droppedGoals, droppedBlocks }
function normalizeData(raw) {
    const clean = {
        schemaVersion: raw?.schemaVersion ?? 1,
        goals: [],
        blocks: []
    };
    let droppedGoals = 0;
    let droppedBlocks = 0;

    const rawGoals = Array.isArray(raw?.goals) ? raw.goals : [];
    const rawBlocks = Array.isArray(raw?.blocks) ? raw.blocks : [];

    // Pass 1: validate goals
    const validGoalIds = new Set();
    rawGoals.forEach(function(g) {
        if (!g || typeof g !== "object") { droppedGoals++; return; }
        if (typeof g.id !== "string" || g.id === "") { droppedGoals++; return; }
        if (typeof g.title !== "string" || g.title.trim() === "") { droppedGoals++; return; }

        clean.goals.push({
            id: g.id,
            title: g.title.trim(),
            createdAt: typeof g.createdAt === "string" ? g.createdAt : new Date().toISOString()
        });
        validGoalIds.add(g.id);
    });

    // Pass 2: validate blocks
    rawBlocks.forEach(function(b) {
        if (!b || typeof b !== "object") { droppedBlocks++; return; }
        if (typeof b.id !== "string" || b.id === "") { droppedBlocks++; return; }
        if (typeof b.title !== "string" || b.title.trim() === "") { droppedBlocks++; return; }
        if (typeof b.goalId !== "string" || !validGoalIds.has(b.goalId)) { droppedBlocks++; return; }

        clean.blocks.push({
            id: b.id,
            goalId: b.goalId,
            title: b.title.trim(),
            description: typeof b.description === "string" ? b.description : "",
            assignedDate: typeof b.assignedDate === "string" ? b.assignedDate : null,
            order: typeof b.order === "number" ? b.order : 1,
            isCompleted: b.isCompleted === true,
            completedAt: typeof b.completedAt === "string" ? b.completedAt : null,
            createdAt: typeof b.createdAt === "string" ? b.createdAt : new Date().toISOString()
        });
    });

    return { data: clean, droppedGoals, droppedBlocks };
}

// Initializes the in-memory data from storage, normalizing it and dropping invalid records.
function initData() {
    const loaded = loadAll();
    const result = normalizeData(loaded);
    plannerData = result.data;
    if (result.droppedGoals > 0 || result.droppedBlocks > 0) {
        console.warn(
            "Dropped invalid records:",
            result.droppedGoals, "goals,", result.droppedBlocks, "blocks"
        );
    }
    return plannerData;
}

// Returns the current in-memory data. Screens read from this.
function getData() {
    return plannerData;
}

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

    // Copy-then-save pattern: build new data, save it, then adopt
    const newData = {
        ...plannerData,
        goals: [...plannerData.goals, newGoal]
    };

    const saved = saveAll(newData);
    if (!saved) {
        return { success: false, error: "Could not save. Storage may be full." };
    }

    plannerData = newData;
    return { success: true, data: newGoal };
}

// Returns blocks for a specific goal, sorted by order.
function getBlocksForGoal(data, goalId) {
    return data.blocks
        .filter(function(b) { return b.goalId === goalId; })
        .sort(function(a, b) { return a.order - b.order; });
}

// Renames a goal. Returns { success, data } or { success, error }.
function updateGoal(goalId, newTitle) {
    const trimmed = (newTitle || "").trim();
    if (trimmed === "") {
        return { success: false, error: "Goal title cannot be empty." };
    }

    const newData = {
        ...plannerData,
        goals: plannerData.goals.map(function(g) {
            return g.id === goalId ? { ...g, title: trimmed } : g;
        })
    };

    const saved = saveAll(newData);
    if (!saved) return { success: false, error: "Could not save." };

    plannerData = newData;
    return { success: true };
}

// Deletes a goal AND its blocks. Returns { success, deletedBlocks }.
function deleteGoal(goalId) {
    const blocksToDelete = plannerData.blocks.filter(function(b) { return b.goalId === goalId; }).length;

    const newData = {
        ...plannerData,
        goals: plannerData.goals.filter(function(g) { return g.id !== goalId; }),
        blocks: plannerData.blocks.filter(function(b) { return b.goalId !== goalId; })
    };

    const saved = saveAll(newData);
    if (!saved) return { success: false, error: "Could not save." };

    plannerData = newData;
    return { success: true, deletedBlocks: blocksToDelete };
}

// Returns all goals sorted by createdAt (oldest first).
function getAllGoalsSorted(data) {
    return [...data.goals].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}