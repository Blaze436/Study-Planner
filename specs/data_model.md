# Study Planner - Data Model

## Key Components

### 1. Goals
**Purpose:** Like a folder stores all the tasks
| Property | What it does | Example |
|----------|--------------|---------|
| id | Unique ID (auto-generated) | `goal_123456789` |
| title | What the goal is called | "Physics Exam Prep" |
| category | Type of goal (study, fitness, work) | "Academics" |
| createdAt | When the goal was created | "2026-08-24" |
| targetDate | When you want it done by (optional) | "2026-09-30" |

### 2. Blocks (Tasks)
**Purpose:** Individual actionable items
| Property | What it does | Example |
|----------|--------------|---------|
| id | Unique ID (auto-generated) | `blk_001` |
| goalId | Which goal this belongs to | `goal_123456789` |
| title | Short description of what to do | "Unit 2: Exercise 3" |
| description | Optional extra details | "Solve Q1-10, page 45" |
| estimatedMinutes | How long it should take (optional) | 45 |
| assignedDate | Which date this task is for | "2026-09-01" |
| isCompleted | Is it done? | true/false |
| completedAt | When it was marked done (null if not) | "2026-09-01T14:30:00" |

### 3. Date System (MVP)
- **Purpose:** Assign tasks to specific dates
- **Method:** Simple date picker
- **Storage:** `YYYY-MM-DD` format


### 4. Tick-off System
- **Purpose:** Mark tasks as complete
- **Mechanism:** Checkbox that updates `isCompleted`
- **Effect:** Updates goal's progress in percentage

---

## Data Flow

### Step 1: User creates a Goal
User enters title and category(Goal is saved in memory)

### Step 2: User creates blocks within the Goal
User enters title, description and Selects a date(Block is saved and linked via Goal)

### Step 3: User opens the app on a specific date
App checks the current date, filters blocks and displays blocks assigned to this date

### Step 4:User ticks off a block
After completing the task user clicks the checkbox, the task is registered as complete and app updates the progress' percentage


---

## Complete Example

### Scenario: Physics Exam Prep

**User Creates a Goal:**
| Property | Value |
|----------|-------|
| id | `goal_1724512345678` |
| title | "Physics Exam Prep" |
| category | "Academics" |
| createdAt | "2026-08-24" |

**User creates Blocks:**
| id | goalId | title | description | assignedDate | isCompleted |
|----|--------|-------|-------------|--------------|-------------|
| blk_001 | goal_1724512345678 | "Unit 2: Exercise 3" | "Solve Q1-10, page 45" | 2026-09-01 | false |
| blk_002 | goal_1724512345678 | "Unit 3: Exercise 1" | "Read examples 2-4" | 2026-09-01 | false |
| blk_003 | goal_1724512345678 | "Unit 3: Exercise 2" | "Solve Q1-12" | 2026-09-02 | false |

**User open the app on a specific date(Sept 1):**

#### Physics Exam Prep - Progress: 0 of 3 complete (0%)
#### Today:
- Physics Exam Prep: Unit 2: Exercise 3
- Physics Exam Prep: Unit 3: Exercise 1

**AFTER TICKING IT OFF:**

#### Physics Exam Prep - Progress: 2 of 3 complete (67%)
#### Today:
- Physics Exam Prep: Unit 2: Exercise 3 ✅
- Physics Exam Prep: Unit 3: Exercise 1 ✅

