# Dutch900 - Full Application Specification PRD

**Version:** 1.0.0
**Last Updated:** 2026-01-14
**Status:** Source of Truth

> **CRITICAL**: This document serves as the authoritative specification for the Dutch900 application. All features described here MUST be preserved during any code modifications. Features should NOT be removed or altered without explicit approval and updating this document.

---

## 1. Introduction/Overview

Dutch900 is a flashcard-based language learning Progressive Web App (PWA) designed to help users master 900 Dutch vocabulary words. The app follows a three-level progression system inspired by spaced repetition principles, taking users from basic recognition through active recall and production.

### Problem Statement
Learning Dutch vocabulary requires consistent practice with increasing difficulty. Users need a structured progression from passive recognition to active production, with proper tracking of progress across chapters from their textbook.

### High-Level Goal
Provide an engaging, mobile-first vocabulary learning experience that systematically moves users through three mastery stages for 900 Dutch words organized into 42 textbook chapters.

---

## 2. Goals

- Enable users to learn 900 Dutch vocabulary words through progressive difficulty stages
- Provide immediate audio feedback using Dutch pronunciation
- Track progress per-word and per-chapter with persistent storage
- Support offline learning through PWA capabilities
- Deliver a clean, Duolingo-inspired user interface
- Allow focused practice on specific chapters or review of mistakes across all chapters

---

## 3. User Stories

### Learning Progression
- **US-1**: As a learner, I want to see a Dutch word and flip to reveal the English translation so that I can build recognition.
- **US-2**: As a learner, I want to type the Dutch word with its article (de/het) when given the English so that I practice spelling and gender.
- **US-3**: As a learner, I want to type just the Dutch word when given the English so that I can demonstrate full mastery.

### Card Interactions
- **US-4**: As a user, I want cards to animate in from the bottom with a bounce effect so that the interface feels dynamic and engaging.
- **US-5**: As a user, I want to flip cards back and forth by clicking so that I can review both sides freely.
- **US-6**: As a user, I want to hear the Dutch pronunciation ONLY when the card flips to reveal the answer so that audio reinforces the correct word at the right moment.
- **US-7**: As a user, I want to see correct/wrong answer buttons appear AFTER flipping the card so that I must think before answering.
- **US-8**: As a user, I want cards to swipe left (wrong) or right (correct) with rotation when I answer so that my choice is visually confirmed.

### Progress Tracking
- **US-9**: As a learner, I want to progress through 42 textbook chapters so that my learning aligns with my course material.
- **US-10**: As a learner, I want words to move through stages (qualifying -> pit radio -> victory lap -> mastered) so that I can track my progression.
- **US-11**: As a learner, I want a "Review Mistakes" feature to practice words I got wrong across all chapters so that I can focus on weak areas.
- **US-12**: As a user, I want to see a chapter grid showing my progress with color coding so that I can quickly identify which chapters need attention.

### Statistics and Streaks
- **US-13**: As a user, I want to see my current streak, total reviews, and mastered word count so that I stay motivated.
- **US-14**: As a user, I want a visual progress bar showing words in each stage so that I understand my overall progress.

---

## 4. Functional Requirements

### 4.1 Three-Level Learning Progression

**FR-1**: The system must provide exactly three learning levels with the following characteristics:

| Level | Name | Internal Mode | Card Type | User Action | Audio Trigger |
|-------|------|---------------|-----------|-------------|---------------|
| 1 | Learn | `reading` / `qualifying` | Flip card | See Dutch, flip to see English, mark correct/wrong | On flip to back only |
| 2 | Listen | `listening` / `pitradio` | Audio + typing | Hear Dutch audio (NO text shown), type what you heard | Auto-play on card entry, replay button available |
| 3 | Produce | `production` / `victorylap` | Typing input | See English word, type the Dutch translation | After answer submission |

**FR-2**: The system must show the Dutch word on the front of flip cards and the English translation on the back (Learn mode only).

**FR-3**: Listen mode must NOT show any text - only play audio. User types what they heard. A speaker/replay button allows hearing the word again.

**FR-4**: Produce mode shows the English word and requires user to type the Dutch translation.

### 4.2 Card Animations and Interactions (CRITICAL)

**FR-5**: Cards MUST slide in from the bottom with a bounce animation using the following CSS timing:
```css
transform: translateY(250px) -> translateY(0)
transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out
```

**FR-6**: Cards MUST support bidirectional flipping - users can click to flip back and forth between front and back.

**FR-7**: The flip animation MUST use 3D CSS transforms with the following characteristics:
- `perspective: 1000px` on container
- `transformStyle: preserve-3d` on card elements
- `transform: rotateY(180deg)` for flipped state
- `backfaceVisibility: hidden` on both faces
- `transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)` for flip

**FR-8**: Answer buttons (correct/wrong) MUST only appear AFTER the card has been flipped to the back.

**FR-9**: Answer buttons MUST render with opacity/pointer-events controlled by flip state:
```css
opacity: isFlipped ? 1 : 0
pointerEvents: isFlipped ? 'auto' : 'none'
```

**FR-10**: On answering, cards MUST animate with swipe + rotation:
- Wrong (left): `translateX(-250px) rotate(-15deg)`
- Correct (right): `translateX(250px) rotate(15deg)`
- Timing: `transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out`

**FR-11**: Card backgrounds MUST change color during exit animation:
- Wrong: background transitions to `#fecaca` (light red)
- Correct: background transitions to `#bbf7d0` (light green)

### 4.3 Audio Behavior (CRITICAL)

**FR-12**: In Learn mode (flip cards), audio MUST play:
- When the card is first displayed (Dutch word visible on front)
- When the card is flipped BACK to the front (Dutch word side)
- Audio does NOT play when flipping to the back (English side)

**FR-13**: Audio MUST use the Web Speech API with Dutch language (`nl-NL`).

**FR-14**: The system must provide `speakDutch(text, rate)` function with default rate of 0.9.

**FR-15**: The system must cancel any ongoing speech before playing new audio.

**FR-16**: In typing modes (Listen/Produce), audio MUST play after the answer is submitted (on reveal of correct answer).

### 4.4 Listen Mode Behavior (Level 2)

**FR-17**: Listen mode must automatically play the Dutch word audio when the card appears.

**FR-18**: Listen mode must NOT display any text of the word - only a speaker icon and replay button.

**FR-19**: The system must provide a large speaker/audio icon that users can click to replay the audio.

**FR-20**: User types what they heard in the input field with placeholder "Type what you hear...".

**FR-21**: For nouns, the expected answer includes the article: `{gender} {dutch}` (e.g., "de hond").

**FR-22**: A hint text "Include the article (de/het) for nouns" should be shown.

### 4.5 Produce Mode Behavior (Level 3)

**FR-23**: Produce mode displays the English word prominently.

**FR-24**: User types the Dutch translation (without article requirement).

**FR-25**: Input placeholder: "Type Dutch word...".

### 4.6 Common Typing Behavior (Listen & Produce)

**FR-26**: The system must provide a "Check" button that is disabled when input is empty.

**FR-27**: On correct answer, the system must display "Correct!" in green (`#58CC02`).

**FR-28**: On wrong answer, the system must display "It was: [correct answer]" in red (`#FF4B4B`).

**FR-29**: Answer comparison MUST be case-insensitive with trimmed whitespace.

**FR-30**: The system must auto-advance to the next card after 1500ms following answer feedback display.

### 4.5 Answer Buttons (Learn Mode)

**FR-24**: The wrong button MUST display "X" (cross mark) with background color `#FF4B4B`.

**FR-25**: The correct button MUST display "check mark" with background color `#58CC02`.

**FR-26**: Both buttons MUST be full-width with `flex-1`, `py-5`, `rounded-2xl`.

### 4.6 Progress Bar

**FR-27**: A progress bar MUST appear at the top of review sessions showing `currentIndex + 1 / totalCards`.

**FR-28**: The progress bar fill MUST use green color (`#58CC02`).

**FR-29**: The progress bar container MUST be `w-24 h-2 bg-gray-200 rounded-full`.

### 4.7 Index Card Style (Card Back)

**FR-30**: The back of flip cards MUST have an "index card" appearance with horizontal lines:
```css
background: repeating-linear-gradient(transparent, transparent 23px, #e5e5e5 23px, #e5e5e5 24px), white
border-bottom: 4px solid #d1d5db
```

**FR-31**: During exit animation, index card lines MUST change color:
- Wrong: lines `#fca5a5`, background `#fecaca`
- Correct: lines `#86efac`, background `#bbf7d0`

### 4.8 Chapter System

**FR-32**: The system must support exactly 42 chapters from the textbook.

**FR-33**: Each chapter must track per-word progress through four stages:
- `qualifying` (Level 1 - Learn)
- `pitradio` (Level 2 - Practice)
- `victorylap` (Level 3 - Master)
- `mastered` (Complete)

**FR-34**: The system must provide a "Review Mistakes" (Rematch) feature that collects all words with `wrongCount > 0` and `stage !== 'mastered'` across all chapters.

**FR-35**: The chapter grid must display 42 numbered tiles in a 3-column layout.

**FR-36**: Chapter tiles must be color-coded:
- Not started: white with gray border
- In progress: blue (`#1CB0F6`)
- Complete: green (`#58CC02`)
- Complete chapters show a star badge

### 4.9 Progression Logic

**FR-37**: Correct answer moves word to next stage:
- qualifying -> pitradio
- pitradio -> victorylap
- victorylap -> mastered

**FR-38**: Wrong answer moves word back one stage (but not below qualifying):
- victorylap -> pitradio
- pitradio -> qualifying

**FR-39**: ALL lesson sessions are limited to exactly 10 cards maximum, regardless of mode.

**FR-40**: Learn mode auto-fills to 10 words with new words if fewer than 10 are in the stage.

**FR-41**: Listen and Produce modes fill to 10 words by:
1. First taking all words in the target stage (up to 10)
2. If fewer than 10, filling remaining slots with review words from other non-mastered stages
3. Review words are shuffled to provide variety

### 4.10 Keyboard Shortcuts

**FR-41**: In Learn mode (flip cards):
- Space or Enter: flip card (only when not flipped)
- ArrowLeft or 'n': mark wrong (only when flipped)
- ArrowRight or 'y': mark correct (only when flipped)

**FR-42**: In typing modes:
- Enter: submit answer (when input has value and result not shown)

### 4.11 Session Navigation

**FR-43**: A close/X button must appear in the header linking back to home or chapter detail.

**FR-44**: Mode label must display with appropriate color:
- Learn: blue
- Practice: purple
- Master: green

**FR-45**: After completing all cards, display celebration screen with:
- Party emoji
- "Session complete!" message
- Review count
- "Back to Home/Chapter" and "Practice Again" buttons

---

## 5. Non-Goals (Out of Scope)

- **NG-1**: Spaced repetition algorithm (SM-2) - simplified to single correct/wrong progression
- **NG-2**: User authentication or cloud sync
- **NG-3**: Social features or leaderboards
- **NG-4**: Multiple language support (Dutch only)
- **NG-5**: Custom deck creation (fixed 900 words from textbook)
- **NG-6**: Voice recognition for pronunciation checking
- **NG-7**: Sentence/grammar exercises
- **NG-8**: Timed challenges or speed modes

---

## 6. Design Considerations

### 6.1 Color Palette (Duolingo-Inspired)

| Color | Hex | Usage |
|-------|-----|-------|
| Green | `#58CC02` | Correct answers, Master level, progress, primary actions |
| Green Dark | `#58A700` | Green hover states |
| Blue | `#1CB0F6` | Learn level, information |
| Purple | `#CE82FF` | Practice level |
| Yellow | `#FFC800` | Streaks, achievements, stars |
| Red | `#FF4B4B` | Wrong answers, errors |
| Gray | `#AFAFAF` | Muted text |
| Gray Light | `#E5E5E5` | Borders, disabled states |

### 6.2 Typography
- Font family: Inter, system-ui, sans-serif
- Card word text: `text-4xl font-bold`
- Button text: `font-bold text-xl`
- Labels: `text-sm` or `text-xs`

### 6.3 UI Components

**Cards**:
- Max width: `max-w-md`
- Padding: `p-12` for flip cards, `p-8` for typing cards
- Border radius: `rounded-2xl`
- Shadow: `shadow-sm`
- Border: `border border-gray-200` (light) or `border-gray-700` (dark)

**Buttons**:
- Padding: `py-5` for answer buttons, `py-4` for submit
- Border radius: `rounded-2xl`
- Active scale: `active:scale-[0.98]`

**Progress indicators**:
- Circular progress with SVG
- Horizontal stacked bar for stage breakdown

### 6.4 Dark Mode
- Support via Tailwind `dark:` variants
- Toggle based on system preference or user setting
- Background: `dark:bg-gray-800` for cards
- Text: `dark:text-white` for primary, `dark:text-gray-400` for secondary

---

## 7. Technical Considerations

### 7.1 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | ~5.6.0 | Type safety |
| Vite | 6.x | Build tool |
| Tailwind CSS | 3.4.x | Styling |
| Zustand | 5.x | State management |
| Dexie.js | 4.x | IndexedDB wrapper for persistence |
| vite-plugin-pwa | 0.21.x | PWA support |
| React Router | 7.x | Client-side routing |

### 7.2 Key Files and Their Responsibilities

| File | Responsibility |
|------|----------------|
| `src/pages/Review.tsx` | Main review page for Today's practice (all 900 words progression) |
| `src/pages/TrackReview.tsx` | Chapter-specific review page with stage selection |
| `src/pages/Today.tsx` | Home page with practice mode buttons and stats |
| `src/pages/Tracks.tsx` | Chapter selection grid (42 chapters) |
| `src/pages/TrackDetail.tsx` | Individual chapter detail with stage buttons |
| `src/components/FlashCard.tsx` | Reusable flashcard component (legacy) |
| `src/store/index.ts` | Zustand store with global state and actions |
| `src/lib/db.ts` | Dexie database schema and helpers |
| `src/lib/audio.ts` | Web Speech API wrapper for Dutch pronunciation |
| `src/lib/sm2.ts` | SM-2 algorithm implementation (used for initial progress creation) |
| `src/types/index.ts` | TypeScript type definitions |
| `src/data/chapters.ts` | Chapter and word data |
| `src/data/words.json` | 900 Dutch vocabulary words |

### 7.3 Database Schema (Dexie v4)

**Tables**:
```typescript
interface Dutch900DB {
  progress: EntityTable<CardProgress, 'wordId'>;
  stats: EntityTable<UserStats & { id: number }, 'id'>;
  settings: EntityTable<UserSettings & { id: number }, 'id'>;
  chapterProgress: EntityTable<ChapterWordProgress, '[chapterId+wordId]'>;
}
```

**ChapterWordProgress**:
```typescript
interface ChapterWordProgress {
  chapterId: number;
  wordId: number;
  stage: 'qualifying' | 'pitradio' | 'victorylap' | 'mastered';
  correctCount: number;
  wrongCount: number;
  lastSeen: string; // ISO date string
}
```

### 7.4 State Management Pattern

- Global state in Zustand store
- Local component state for UI animations (`isFlipped`, `enterAnimation`, `exitAnimation`)
- Database persistence via Dexie on every state change
- Async data loading in `useEffect` hooks

### 7.5 PWA Requirements

- Service worker for offline support
- Cache strategy for static assets
- Installable on mobile devices
- Works without network connection after initial load

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Words mastered per session | 5-10 | Track `stage === 'mastered'` transitions |
| Daily active users | n/a (personal app) | Track streak continuity |
| Average session length | 5-15 minutes | Track time between session start/end |
| Completion rate | 100% of 900 words | Track total mastered count |
| Error rate (wrong answers) | <20% | Track `wrongCount` vs `correctCount` |
| Audio plays | 100% on flip | Verify `speakDutch` called only on flip to back |

---

## 9. Open Questions

1. **Q1**: Should wrong answers in Learn mode also send words back a stage, or only in Practice/Master?
   - **Current behavior**: Learn mode (qualifying) stays in place on wrong, only advances on correct.

2. **Q2**: Should the app support partial matches (e.g., "hond" accepted for "de hond" in Practice mode)?
   - **Current behavior**: Exact match required including article.

3. **Q3**: Should there be a daily word limit for new words?
   - **Current behavior**: 10 words per Learn session, unlimited for Practice/Master.

4. **Q4**: Should completed chapters allow re-practice from beginning?
   - **Current behavior**: Can practice specific stages, no full reset option.

---

## 10. Critical Implementation Notes

### DO NOT CHANGE without updating this PRD:

1. **Learn mode audio** - Audio plays when card first appears AND when flipped back to Dutch side (NOT on flip to English)
2. **Listen mode audio** - Audio plays automatically on card entry (this IS the exercise)
3. **Listen mode NO TEXT** - Listen mode shows speaker icon only, NO word text
4. **Bidirectional flip** - Learn mode cards can be flipped back and forth freely
5. **Answer button visibility** - Learn mode buttons hidden until card is flipped
6. **Swipe animations** - Left for wrong, right for correct with rotation
7. **Article requirement** - Listen mode requires article for nouns, Produce mode does not
8. **Progress stages** - Exactly 4 stages: qualifying, pitradio, victorylap, mastered
9. **Batch size** - ALL modes limited to 10 cards per lesson
10. **Color scheme** - Blue=Learn, Purple=Listen, Green=Produce, Yellow=achievements
11. **Index card style** - Back of flip cards have lined paper effect
12. **Bounce animation** - Cards enter from bottom with bounce easing

---

## Appendix A: Animation Timing Functions

```css
/* Card entry (bounce) */
cubic-bezier(0.34, 1.56, 0.64, 1)

/* Card flip */
cubic-bezier(0.4, 0, 0.2, 1)

/* Card exit (swipe) */
cubic-bezier(0.4, 0, 0.2, 1)
```

## Appendix B: Word Data Structure

```typescript
interface Word {
  id: number;
  rank: number;
  dutch: string;
  english: string;
  partOfSpeech: PartOfSpeech;
  gender?: 'de' | 'het';  // Only for nouns
  sentences: Sentence[];
}

interface Sentence {
  dutch: string;
  english: string;
}
```

## Appendix C: Review Mode Mapping

| URL Param | Internal Mode | Stage Name | UI Label | Description |
|-----------|--------------|------------|----------|-------------|
| `reading` | `reading` | `qualifying` | Learn 📖 | Flip card: see Dutch, flip to English |
| `listening` | `listening` | `pitradio` | Listen ✍️ | Audio only: hear Dutch, type it |
| `production` | `production` | `victorylap` | Produce 🎯 | See English, type Dutch |

---

**Document End**

*This PRD is the source of truth for Dutch900. Any code changes that conflict with this specification should be considered bugs and reverted.*
