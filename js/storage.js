// js/storage.js
console.log("storage.js loaded");

const STORAGE_KEY = "studyPlanner";
const CORRUPT_KEY = "studyPlanner_corrupt";
const META_KEY = "studyPlanner_meta";
const PREV_KEY = "studyPlanner_prev";
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

// Loads the device-specific meta object. Returns {} if missing or unreadable.
function loadMeta() {
    try {
        const raw = localStorage.getItem(META_KEY);
        if (raw === null) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return {};
        return parsed;
    } catch (e) {
        console.warn("Meta read failed:", e);
        return {};
    }
}

// Saves the meta object. Returns true on success.
function saveMeta(meta) {
    try {
        localStorage.setItem(META_KEY, JSON.stringify(meta));
        return true;
    } catch (e) {
        console.error("Meta save failed:", e);
        return false;
    }
}

// Saves the previous-state snapshot. Returns true on success.
function savePrevSnapshot(wrapper) {
    try {
        localStorage.setItem(PREV_KEY, JSON.stringify(wrapper));
        return true;
    } catch (e) {
        console.error("Prev snapshot save failed:", e);
        return false;
    }
}

// Loads the previous-state snapshot. Returns null if missing or unreadable.
function loadPrevSnapshot() {
    try {
        const raw = localStorage.getItem(PREV_KEY);
        if (raw === null) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        return parsed;
    } catch (e) {
        console.warn("Prev snapshot read failed:", e);
        return null;
    }
}

// Removes the previous-state snapshot.
function clearPrevSnapshot() {
    try {
        localStorage.removeItem(PREV_KEY);
        return true;
    } catch (e) {
        console.error("Prev snapshot clear failed:", e);
        return false;
    }
}

const RECOVERY_KEY = "studyPlanner_recovery";

function saveRecovery(rawData) {
    try { localStorage.setItem(RECOVERY_KEY, rawData); } catch (e) {}
}

function getRecovery() {
    try { return localStorage.getItem(RECOVERY_KEY); } catch (e) { return null; }
}

function clearRecovery() {
    try { localStorage.removeItem(RECOVERY_KEY); } catch (e) {}
}