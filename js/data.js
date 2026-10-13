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

// Creates a new block under an existing goal.
// In: goalId, title, description, assignedDate (may be null)
// Out: { success, data } or { success: false, error }
// Changes: appends to plannerData.blocks and saves.
function createBlock(goalId, title, description, assignedDate) {
    const trimmedTitle = (title || "").trim();
    if (trimmedTitle === "") {
        return { success: false, error: "Task title cannot be empty." };
    }

    const goalExists = plannerData.goals.some(function(g) { return g.id === goalId; });
    if (!goalExists) {
        return { success: false, error: "Goal not found." };
    }

    // order = highest existing order in this goal + 1
    const ordersInGoal = plannerData.blocks
        .filter(function(b) { return b.goalId === goalId; })
        .map(function(b) { return b.order; });
    const nextOrder = ordersInGoal.length === 0
        ? 1
        : Math.max.apply(null, ordersInGoal) + 1;

    const newBlock = {
        id: generateId("blk"),
        goalId: goalId,
        title: trimmedTitle,
        description: (description || "").trim(),
        assignedDate: assignedDate || null,
        order: nextOrder,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date().toISOString()
    };

    const newData = {
        ...plannerData,
        blocks: [...plannerData.blocks, newBlock]
    };

    const saved = saveAll(newData);
    if (!saved) {
        return { success: false, error: "Could not save. Storage may be full." };
    }

    plannerData = newData;
    return { success: true, data: newBlock };
}

// Toggles a block's completion state.
// In: blockId
// Out: { success, data } or { success: false, error }
// Changes: flips isCompleted; sets or clears completedAt; saves.
function toggleBlockComplete(blockId) {
    const block = plannerData.blocks.find(function(b) { return b.id === blockId; });
    if (!block) {
        return { success: false, error: "Task not found." };
    }

    const nowCompleted = !block.isCompleted;
    const newData = {
        ...plannerData,
        blocks: plannerData.blocks.map(function(b) {
            if (b.id !== blockId) return b;
            return {
                ...b,
                isCompleted: nowCompleted,
                completedAt: nowCompleted ? new Date().toISOString() : null
            };
        })
    };

    const saved = saveAll(newData);
    if (!saved) return { success: false, error: "Could not save." };

    plannerData = newData;
    return { success: true, data: newData.blocks.find(function(b) { return b.id === blockId; }) };
}

// Updates a block's editable fields. Cannot change order, completion state, or IDs.
// In: blockId, updates object (may contain title, description, assignedDate)
// Out: { success, data } or { success: false, error }
// Changes: merges provided fields only; saves.
function updateBlock(blockId, updates) {
    const block = plannerData.blocks.find(function(b) { return b.id === blockId; });
    if (!block) return { success: false, error: "Task not found." };

    const newBlock = { ...block };

    if ("title" in updates) {
        const trimmed = (updates.title || "").trim();
        if (trimmed === "") return { success: false, error: "Task title cannot be empty." };
        newBlock.title = trimmed;
    }
    if ("description" in updates) {
        newBlock.description = (updates.description || "").trim();
    }
    if ("assignedDate" in updates) {
        newBlock.assignedDate = updates.assignedDate || null;
    }

    // Never touched: id, goalId, order, isCompleted, completedAt, createdAt

    const newData = {
        ...plannerData,
        blocks: plannerData.blocks.map(function(b) {
            return b.id === blockId ? newBlock : b;
        })
    };

    const saved = saveAll(newData);
    if (!saved) return { success: false, error: "Could not save." };

    plannerData = newData;
    return { success: true, data: newBlock };
}

// Removes a block. Does NOT renumber siblings (gaps allowed).
// In: blockId
// Out: { success } or { success: false, error }
function deleteBlock(blockId) {
    const exists = plannerData.blocks.some(function(b) { return b.id === blockId; });
    if (!exists) return { success: false, error: "Task not found." };

    const newData = {
        ...plannerData,
        blocks: plannerData.blocks.filter(function(b) { return b.id !== blockId; })
    };

    const saved = saveAll(newData);
    if (!saved) return { success: false, error: "Could not save." };

    plannerData = newData;
    return { success: true };
}

// Returns today's blocks grouped by goal.
// In: data
// Out: array of { goal, blocks } — only goals that have at least one task today
function getTodayBlocks(data) {
    const today = getTodayString();
    const todaysBlocks = data.blocks.filter(function(b) { return b.assignedDate === today; });

    const grouped = [];
    data.goals.forEach(function(goal) {
        const goalBlocks = todaysBlocks
            .filter(function(b) { return b.goalId === goal.id; })
            .sort(function(a, b) { return a.order - b.order; });
        if (goalBlocks.length > 0) {
            grouped.push({ goal: goal, blocks: goalBlocks });
        }
    });
    return grouped;
}

// Returns true if a block is missed: has a date, that date is in the past, and it's not complete.
// Single source of truth for "missed" — used by both Today's View and any future label.
function isBlockMissed(block, today) {
    if (!block.assignedDate) return false;
    if (block.isCompleted) return false;
    return block.assignedDate < today; // YYYY-MM-DD strings compare correctly
}

// Returns missed blocks, oldest first.
function getMissedBlocks(data) {
    const today = getTodayString();
    return data.blocks
        .filter(function(b) { return isBlockMissed(b, today); })
        .sort(function(a, b) { return a.assignedDate.localeCompare(b.assignedDate); });
}

// Returns all goals sorted by createdAt (oldest first).
function getAllGoalsSorted(data) {
    return [...data.goals].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}