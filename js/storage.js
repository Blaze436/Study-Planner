// js/storage.js
console.log("storage.js loaded");

const STORAGE_KEY = "studyPlanner";
const CORRUPT_KEY = "studyPlanner_corrupt";
const CURRENT_SCHEMA_VERSION = 1;

// Returns a fresh empty plannerData object. Never share one instance.
function makeEmptyData() {
    return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        goals: [],
        blocks: []
    };
}

function loadAll() {
    let raw;
    try {
        raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        console.warn("localStorage read failed:", error);
        return makeEmptyData();
    }

    if (raw === null) return makeEmptyData();

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.warn("Corrupted data. Saving raw to recovery key.", error);
        try {
            localStorage.setItem(CORRUPT_KEY, raw);
        } catch (_) { /* ignore */ }
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