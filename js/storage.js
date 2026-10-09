// js/storage.js
console.log("storage.js loaded");

const STORAGE_KEY = "studyPlanner";
const CURRENT_SCHEMA_VERSION = 1;

// Returns a fresh empty plannerData object. Never share one instance.
function makeEmptyData() {
    return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        goals: [],
        blocks: []
    };
}

// Loads the plannerData from localStorage. Self-heals if corrupted.
function loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);

    // First-time user
    if (raw === null) return makeEmptyData();

    try {
        const parsed = JSON.parse(raw);
        // Ensure shape
        return {
            schemaVersion: parsed.schemaVersion ?? 1,
            goals: Array.isArray(parsed.goals) ? parsed.goals : [],
            blocks: Array.isArray(parsed.blocks) ? parsed.blocks : []
        };
    } catch (error) {
        console.warn("Corrupted data. Clearing.", error);
        localStorage.removeItem(STORAGE_KEY);
        return makeEmptyData();
    }
}

// Saves the plannerData to localStorage.
function saveAll(plannerData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plannerData));
        return true;
    } catch (error) {
        console.error("Save failed:", error);
        return false;
    }
}