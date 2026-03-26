# Dashboard Feature Documentation

## 📋 Overview

The **Dashboard** is the central hub where users track their daily Islamic deeds, monitor their prayer completion, view statistics, and maintain their spiritual streak. It combines real-time data from Firestore with localStorage persistence for seamless UX.

---

## 🎯 Core Concepts

### 1. **Deeds & Todos**
- **Regular Deeds**: User-added tasks (Read Quran, Give Sadaqah, etc.)
- **Mandatory Todo**: "Pray all 5 Farz Salah" - a special synthetic todo that:
  - Always appears first in the todo list
  - Counts as **1 deed** in the total count
  - Only completes when all 5 prayers are checked
  - Cannot be deleted (locked with 🔒 icon)

### 2. **Prayer System**
- 5 individual prayers: Fajr (20pts), Dhuhr (10pts), Asr (10pts), Maghrib (10pts), Isha (20pts)
- Each prayer creates a separate `deed_log` in Firestore for points tracking
- Prayer state uses **hybrid storage**:
  - **localStorage** (cache): `hasanat-prayers-state-YYYY-MM-DD` - instant UI
  - **Firestore** (source of truth): `deed_logs` collection - cross-device sync
- Automatically syncs across devices (mobile/desktop)
- Resets automatically at midnight

### 3. **Points Calculation**
- Points are calculated from `deed_logs` collection (NOT from todos)
- Each completed deed creates a `deed_log` with `pointsAtLogTime`
- Real-time updates via Firestore snapshot listeners
- **Example**: 5 prayers (70pts) + 1 custom deed (5pts) = 75 points today

### 4. **Streak System**
- **Requirements**: All todos complete + All 5 prayers logged
- **Consecutive days**: Streak increments
- **Miss a day**: Streak resets to 0 at midnight (00:05 AM BST)
- Managed by Firebase Cloud Functions (see below)

---

## 📦 Components

### **Dashboard.tsx** (Main Page)
- **Purpose**: Root dashboard page with bento-style layout
- **Key Features**:
  - Hero header with bismillah, user greeting, streak display
  - Farz completion badge (shows when all 5 prayers done)
  - Staggered animations via Framer Motion
- **State**:
  - `allFarzCompleted`: Boolean flag from `FarzPrayerChecklist`
  - Passed to `TodaysDeeds` for mandatory todo sync

### **StatsBar.tsx**
- **Purpose**: Top statistics strip with 4 key metrics
- **Metrics**:
  1. ⭐ **Points Today**: Total from `deed_logs`
  2. 📋 **Deeds Today**: `completedCount/totalCount` from todos
  3. 🔥 **Current Streak**: Live from `streaks/{uid}`
  4. 📊 **This Week**: 7-day deed count + mini bar chart
- **Data Sources**:
  - `useTodayTodos(allPrayersCompleted)` - todos count
  - `useStreak()` - streak data
  - `useWeekGraph()` - weekly deed logs
  - `usePrayerChecklistState()` - prayer completion status

### **FarzPrayerChecklist.tsx**
- **Purpose**: Interactive 5-prayer tracker with progress bar
- **Features**:
  - Segmented progress dots (5 dots for 5 prayers)
  - Hadith quotes for each prayer
  - Real-time prayer time display
  - Points display per prayer
  - "All complete" banner when done
- **State**: `usePrayerChecklistState()` hook
- **Callback**: `onAllCompleted(boolean)` → updates `Dashboard` state

### **TodaysDeeds.tsx**
- **Purpose**: Main todo list with add/complete/delete functionality
- **Features**:
  - Mandatory "Pray all 5 Farz Salah" todo (always first)
  - User-added custom deeds
  - Progress bar header
  - Modal dialog to add deeds (preset + custom)
  - Search & category filters
- **State**: `useTodayTodos(autoCompleteSalah)` hook
- **UI Handling**:
  - Mandatory todo: Shows lock icon, disabled checkbox, "Mandatory" badge
  - Regular todos: Show delete button on hover

### **StreakCard.tsx**
- **Purpose**: Animated streak display with 7-day mini calendar
- **Features**:
  - Large animated fire emoji 🔥
  - Current streak number
  - Longest streak (personal best)
  - 7-day dot indicator (active/inactive/today)
  - Emerald gradient background
- **Data**: `useStreak()` + `useWeekGraph()`

### **PrayerTimeWidget.tsx**
- **Purpose**: Shows next prayer time with countdown
- **Features**:
  - Auto-calculates prayer times (via `usePrayerTimes()`)
  - Highlights current/next prayer
  - Timezone-aware
- **Note**: Prayer times calculated client-side (no API)

### **DateCalendarWidget.tsx**
- **Purpose**: Displays Gregorian + Hijri dates
- **Features**:
  - Current date in English
  - Islamic Hijri date in Arabic
  - Bangla date option
- **Data**: `useHijriDate()` + `useBanglaDate()`

### **CityPreview.tsx**
- **Purpose**: Quick preview link to DeedCity 3D visualization
- **Action**: Navigates to `/my-city` page

### **HadithWidget.tsx**
- **Purpose**: Daily hadith display with random rotation
- **Features**:
  - Hadith text in Arabic + English
  - Source attribution
  - Refreshes daily

---

## 🪝 Custom Hooks

### **`useTodayTodos(allPrayersCompleted: boolean)`**
**Location**: `hooks/useTodayTodos.ts`

**Purpose**: Manages today's todo list with mandatory prayer todo

**Returns**:
```typescript
{
  todos: Todo[],              // All todos (mandatory + user-added)
  loading: boolean,
  completedCount: number,     // Count of completed todos
  totalCount: number,         // Total todos (includes mandatory)
  todayPoints: number,        // Calculated from deed_logs
  addedDeedIds: Set<string>,  // For duplicate checking
  addDeedToToday: (input) => Promise<boolean>,
  toggleTodo: (todo) => Promise<void>,
  deleteTodo: (todo) => Promise<void>,
}
```

**Key Logic**:
1. Queries Firestore `todos` collection for today's date
2. Creates a **synthetic mandatory todo** with `isMandatory: true`
3. Sets mandatory todo's `completed` status from `allPrayersCompleted` param
4. Calculates `todayPoints` from `deed_logs` collection (separate query)

**Firestore Writes**:
- `addDeedToToday()`: Writes to `todos` collection
- `toggleTodo()`: Updates `todos` + creates/deletes `deed_logs`
- `deleteTodo()`: Deletes from `todos` + cleanup `deed_logs`

---

### **`usePrayerChecklistState(onAllCompleted?)`**
**Location**: `hooks/usePrayerChecklistState.ts`

**Purpose**: Manages 5-prayer checklist with localStorage persistence

**Returns**:
```typescript
{
  prayers: FarzPrayer[],      // 5 prayers with completion status
  toggle: (id: string) => Promise<void>,
  completed: number,          // Count of completed prayers
  totalPoints: number,        // Sum of completed prayer points
  progressPct: number,        // Percentage (0-100)
}
```

**Key Features**:
- **localStorage key**: `hasanat-prayers-state-YYYY-MM-DD`
- **Daily reset**: Midnight timer checks for new day
- **Firestore sync**: Each toggle creates/deletes `deed_log`
- **Callback**: Fires `onAllCompleted(boolean)` via `useEffect`

**Prayer Point Values**:
```typescript
Fajr:    20 points
Dhuhr:   10 points
Asr:     10 points
Maghrib: 10 points
Isha:    20 points
Total:   70 points
```

---

### **`useStreak()`**
**Location**: `hooks/useStreak.ts`

**Purpose**: Real-time streak data from Firestore

**Returns**:
```typescript
{
  currentStreak: number,
  longestStreak: number,
  lastStreakDate: string,   // "YYYY-MM-DD"
  loading: boolean,
}
```

**Data Source**: `streaks/{uid}` Firestore document (live listener)

---

### **`useWeekGraph()`**
**Location**: `hooks/useWeekGraph.ts`

**Purpose**: Last 7 days deed count for mini charts

**Returns**:
```typescript
{
  data: WeekGraphDay[],     // [{date: "2026-03-26", count: 5}, ...]
  weekTotal: number,        // Sum of all counts
  loading: boolean,
}
```

**Data Source**: `deed_logs` collection filtered by date range

---

### **`useAddDeedModal(addedDeedIds: Set<string>)`**
**Location**: `hooks/useAddDeedModal.ts`

**Purpose**: Deed search/filter logic for "Add Deed" modal

**Returns**:
```typescript
{
  filteredDeeds: ModalDeed[],
  search: string,
  setSearch: (val: string) => void,
  filterCategory: string | null,
  setFilterCategory: (cat: string | null) => void,
  isLoading: boolean,
  DIFFICULTY_INFO: Record<string, { label: string, color: string }>,
}
```

**Features**:
- Combines preset deeds + custom deeds
- Filters out already-added deeds
- Search by name/description
- Filter by category

---

## 🔥 Client-Side Logic (Replaced Firebase Functions)

> **Note**: As of March 26, 2026, all Firebase Functions have been migrated to client-side logic to stay in the free tier and prepare for future Node + MongoDB backend.

### **`streakService.ts`**
**File**: `src/lib/firestore/streakService.ts`  
**Purpose**: Handles all streak + points logic client-side

**Functions**:

#### 1. `checkStreakReset(userId)`
**When**: Runs on app mount (via `useStreak` hook)  
**Logic**:
```
If lastStreakDate < yesterday:
  → Set currentStreak = 0
```

#### 2. `checkAndUpdateStreak(userId)`
**When**: Called after every deed/prayer completion  
**Logic**:
```
1. Check if all todos for today are complete
2. Check if all 5 prayers are logged (prayer_fajr, prayer_dhuhr, etc.)
3. If both true → Update streaks/{uid}:
   - If lastStreakDate = yesterday → currentStreak++
   - If lastStreakDate < yesterday → currentStreak = 1
   - Update longestStreak if needed
```

#### 3. `completeDeedWithEffects(userId, points)`
**When**: Called inside `createDeedLog()`  
**Logic**:
```
1. Update users/{uid}.totalPoints (+points)
2. Call checkAndUpdateStreak(userId)
```

#### 4. `uncompleteDeedWithEffects(userId, points)`
**When**: Called inside `deleteDeedLogByTodoId()`  
**Logic**:
```
1. Update users/{uid}.totalPoints (-points)
2. Streak is NOT reverted (once earned, stays until midnight)
```

---

## 📊 Data Flow Diagram

```
User Actions                 Frontend State              Firestore               Client Logic
────────────────────────────────────────────────────────────────────────────────────────────────

✅ Check Prayer           →  usePrayerChecklistState  →  deed_logs/{id}      →  completeDeedWithEffects
   (Fajr)                    - localStorage update        (create doc)            - Add points
                             - Call toggle()                                      - Check todos/prayers
                                                                                  - Update streak

✅ Complete Todo          →  useTodayTodos            →  todos/{id}          →  (update complete)
   (Read Quran)              - Call toggleTodo()          (update doc)
                                                       →  deed_logs/{id}      →  completeDeedWithEffects
                                                          (create doc)            - Add points
                                                                                  - Check streak

❌ Uncheck Todo           →  useTodayTodos            →  todos/{id}          →  (update incomplete)
                              - Call toggleTodo()          (update doc)
                                                       →  deed_logs/{id}      →  uncompleteDeedWithEffects
                                                          (delete doc)            - Subtract points

🗑️ Delete Todo            →  useTodayTodos            →  todos/{id}          →  (delete)
                              - Call deleteTodo()          (delete doc)
                                                       →  deed_logs/{id}      →  onDeedLogDeleted
                                                          (delete if exists)      (if completed)

🌙 Midnight (00:05 AM)                                                       →  dailyStreakCheck
                                                                                 - Reset broken streaks
```

---

## 🎨 UI State Synchronization

### Problem: Two Components, One Source of Truth
`StatsBar` and `TodaysDeeds` both show deed counts, but they must stay in sync.

### Solution: Pass Prayer Status to Hook
```typescript
// StatsBar.tsx
const { prayers } = usePrayerChecklistState();
const allPrayersCompleted = prayers.every(p => p.completed);
const { completedCount, totalCount } = useTodayTodos(allPrayersCompleted);

// TodaysDeeds.tsx
const { completedCount, totalCount } = useTodayTodos(autoCompleteSalah);
```

Both components receive the same `allPrayersCompleted` flag → mandatory todo syncs correctly.

---

## 🗄️ Firestore Schema

### **`todos` Collection**
```typescript
{
  id: string,
  userId: string,
  date: "YYYY-MM-DD",        // Local date string
  deedId: string,            // Reference to preset/custom deed
  deedType: "preset" | "custom",
  name: string,
  emoji: string,
  category: DeedCategory,
  difficulty: DeedDifficulty,
  points: number,
  completed: boolean,
  completedAt: Timestamp | null,
  addedAt: Timestamp,
}
```

**Note**: Mandatory "Pray all 5 Farz Salah" todo is **NOT stored in Firestore** - it's synthetic (created client-side).

---

### **`deed_logs` Collection**
```typescript
{
  id: string,
  userId: string,
  date: "YYYY-MM-DD",
  deedId: string,            // "prayer_fajr" or deed reference
  deedType: "preset" | "custom",
  todoId: string,            // Reference to source todo
  name: string,
  emoji: string,
  category: DeedCategory,
  pointsAtLogTime: number,   // Points at the time of logging
  loggedAt: Timestamp,
}
```

**Purpose**: Immutable log of completed deeds for points/streak calculation.

---

### **`streaks` Collection**
```typescript
{
  userId: string,
  currentStreak: number,
  longestStreak: number,
  lastStreakDate: "YYYY-MM-DD",
  updatedAt: Timestamp,
}
```

---

## 🔒 localStorage Schema

### Prayer State (Hybrid Cache)
**Key**: `hasanat-prayers-state-YYYY-MM-DD`

**Value**:
```json
{
  "fajr": { "completed": true },
  "dhuhr": { "completed": true },
  "asr": { "completed": false },
  "maghrib": { "completed": false },
  "isha": { "completed": false }
}
```

**Purpose**: Cache layer for instant UI rendering

**Lifecycle**:
1. **Mount**: Load from localStorage → render instantly (no flicker)
2. **Background Sync**: Query `deed_logs` from Firestore → reconstruct truth
3. **Update**: When Firestore returns → merge into state → save back to cache
4. **Toggle**: Update localStorage immediately → write `deed_log` to Firestore
5. **Midnight**: Cleared/ignored when date changes (new day key)

**Cross-Device Sync**:
- ✅ **Device A**: Check Fajr → creates `deed_log` in Firestore
- ✅ **Device B**: Opens app → queries `deed_logs` → Fajr shows checked
- ✅ **Result**: Prayer state syncs across all devices automatically

**Implementation**: See `usePrayerChecklistState.ts` (lines 120-172)

---

## 🚨 Common Pitfalls & Solutions

### 1. **"Cannot update component during render" Error**
**Cause**: Calling `onAllCompleted()` inside `setState` callback  
**Solution**: Use `useEffect` to notify parent of state changes

### 2. **StatsBar shows wrong count**
**Cause**: Not passing `allPrayersCompleted` param to `useTodayTodos()`  
**Solution**: Read prayer status first, then pass to hook

### 3. **Points don't match todos**
**Cause**: Calculating points from `todos` array instead of `deed_logs`  
**Solution**: Always query `deed_logs` for accurate point totals

### 4. **Streak doesn't increment**
**Cause**: Missing required conditions (all todos + all 5 prayers)  
**Solution**: Check Firebase Function logs for why condition failed

### 5. **Prayer state not syncing across devices**
**Cause**: Only reading from localStorage (device-specific cache)  
**Solution**: System now auto-syncs from Firestore `deed_logs` on mount ✅  
**How it works**:
- Mount sequence: localStorage (instant) → Firestore query (background) → merge → cache update
- deed_logs collection is the source of truth for prayer state
- Prayer checkboxes reconstruct from existing deed_logs automatically
- Works across mobile/desktop/web without manual intervention

---

## 🧪 Testing Checklist

### Prayer System
- [ ] Check individual prayers → points update immediately
- [ ] Check all 5 prayers → mandatory todo marks complete
- [ ] Uncheck prayer → points subtract, mandatory todo uncompletes
- [ ] Midnight passes → prayer state resets for new day

### Cross-Device Sync
- [ ] **Device A**: Check Fajr prayer → verify deed_log created
- [ ] **Device B**: Open app → verify Fajr shows checked automatically
- [ ] **Device A**: Uncheck Fajr → deed_log deleted
- [ ] **Device B**: Refresh → verify Fajr shows unchecked
- [ ] **Test**: Clear localStorage on Device B → should still sync from Firestore

### Todo System
- [ ] Add custom deed → appears in list
- [ ] Complete todo → creates deed_log, points update
- [ ] Delete completed todo → removes deed_log, points subtract
- [ ] Mandatory todo shows locked, cannot delete

### Streak System
- [ ] Complete all todos + all prayers → streak increments
- [ ] Miss a day → streak resets at midnight
- [ ] Check yesterday's date in `lastStreakDate`

### UI Sync
- [ ] StatsBar and TodaysDeeds show same counts
- [ ] Points update real-time in StatsBar
- [ ] Progress bars match completion status

---

## 📚 Related Documentation

- **Migration Guide**: See `/FIREBASE_FUNCTIONS_MIGRATION.md` for details on client-side refactor
- **Streak Service**: See `src/lib/firestore/streakService.ts` for client-side logic
- **Prayer Times**: See `src/hooks/usePrayerTimes.ts`
- **DeedCity Integration**: See `src/features/city/`
- **i18n System**: See `src/i18n/translations.ts`

---

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy Firebase Functions
cd functions && npm run deploy

# Test locally
npm run test
```

---

**Last Updated**: March 26, 2026  
**Maintained by**: Development Team
