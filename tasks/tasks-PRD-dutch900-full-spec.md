# Dutch900 PRD Implementation Tasks

**Generated from:** `/Users/monicaharvancik/Projects/dutch900/tasks/PRD-dutch900-full-spec.md`
**Date:** 2026-01-14
**Last Updated:** 2026-01-14

---

## Summary

This task list verifies and implements all features from the Dutch900 PRD. The app is functional with recent fixes to React hooks ordering, Listen mode (audio-only display), and button label visibility. Each task below systematically verifies PRD requirements and addresses any gaps.

---

## Tasks

- [ ] 1.0 Verify and Fix Learn Mode (Reading/Qualifying) Implementation
  > Ensure Learn mode correctly shows Dutch word on front, English on back, with proper flip mechanics, audio triggering only on flip to back, and answer buttons appearing only after flip.
  - [ ] 1.1 Verify Learn mode shows Dutch word on card front (FR-2)
  - [ ] 1.2 Verify Learn mode shows English translation on card back (FR-2)
  - [ ] 1.3 Verify bidirectional flip works (click to flip back and forth) (FR-6)
  - [ ] 1.4 Verify audio plays ONLY on flip to back, NOT on card entry (FR-12)
  - [ ] 1.5 Verify answer buttons (X and checkmark) hidden until card flipped (FR-8, FR-9)
  - [ ] 1.6 Verify button colors: red (#FF4B4B) for wrong, green (#58CC02) for correct (FR-24, FR-25)

- [ ] 2.0 Verify and Fix Listen Mode (Pitradio) Implementation
  > Ensure Listen mode plays audio only with NO text displayed, provides replay functionality, auto-plays on card entry, and requires article+word for nouns.
  - [ ] 2.1 Verify Listen mode shows speaker icon ONLY, no Dutch word text (FR-3, FR-18)
  - [ ] 2.2 Verify audio auto-plays when card appears (FR-17)
  - [ ] 2.3 Verify replay button works (FR-19)
  - [ ] 2.4 Verify placeholder shows "Type what you hear..." or similar (FR-20)
  - [ ] 2.5 Verify noun answers require article format: "de/het word" (FR-21)
  - [ ] 2.6 Verify hint text "Include the article (de/het) for nouns" is shown for nouns (FR-22)

- [ ] 3.0 Verify and Fix Produce Mode (Victorylap) Implementation
  > Ensure Produce mode shows English word, requires typing Dutch translation (no article), and plays audio after answer submission.
  - [ ] 3.1 Verify Produce mode shows English word prominently (FR-23)
  - [ ] 3.2 Verify part of speech is displayed below the English word
  - [ ] 3.3 Verify input placeholder says "Type Dutch word..." (FR-25)
  - [ ] 3.4 Verify article is NOT required for answers (FR-24)
  - [ ] 3.5 Verify audio plays after answer submission (FR-16)

- [ ] 4.0 Verify Card Animations and Interactions Match PRD Specifications
  > Ensure bounce entry animation, 3D flip animation, swipe exit animations, index card styling, and color transitions all match exact PRD CSS specifications.
  - [ ] 4.1 Verify bounce entry animation: translateY(250px)->0 with cubic-bezier(0.34,1.56,0.64,1) (FR-5)
  - [ ] 4.2 Verify 3D flip uses perspective:1000px, preserve-3d, rotateY(180deg) (FR-7)
  - [ ] 4.3 Verify flip transition: 0.6s cubic-bezier(0.4,0,0.2,1) (FR-7)
  - [ ] 4.4 Verify wrong answer swipe: translateX(-250px) rotate(-15deg) (FR-10)
  - [ ] 4.5 Verify correct answer swipe: translateX(250px) rotate(15deg) (FR-10)
  - [ ] 4.6 Verify exit timing: 0.4s cubic-bezier(0.4,0,0.2,1) (FR-10)
  - [ ] 4.7 Verify card back has index card lines (repeating-linear-gradient) (FR-30)
  - [ ] 4.8 Verify wrong exit: lines #fca5a5, background #fecaca (FR-11, FR-31)
  - [ ] 4.9 Verify correct exit: lines #86efac, background #bbf7d0 (FR-11, FR-31)

- [ ] 5.0 Verify Progress Tracking and Stage Progression Logic
  > Ensure words correctly move through stages (qualifying -> pitradio -> victorylap -> mastered), wrong answers demote appropriately, and Learn mode batches auto-fill to 10 words.
  - [ ] 5.1 Verify correct answer advances: qualifying->pitradio->victorylap->mastered (FR-37)
  - [ ] 5.2 Verify wrong answer demotes: victorylap->pitradio, pitradio->qualifying (FR-38)
  - [ ] 5.3 Verify qualifying stage does NOT demote below qualifying on wrong (FR-38)
  - [ ] 5.4 Verify Learn mode batches auto-fill to 10 words with new words (FR-39)
  - [ ] 5.5 Verify Practice/Master modes take ALL words in that stage (FR-40)

- [ ] 6.0 Verify Chapter System and Review Mistakes Feature
  > Ensure 42 chapters display correctly, chapter tiles are color-coded properly, and Review Mistakes (Rematch) collects all words with wrongCount > 0 across all chapters.
  - [ ] 6.1 Verify 42 chapters are displayed in the chapter grid (FR-32)
  - [ ] 6.2 Verify 3-column layout for chapter tiles (FR-35)
  - [ ] 6.3 Verify color coding: white/gray=not started, blue=#1CB0F6=in progress, green=#58CC02=complete (FR-36)
  - [ ] 6.4 Verify complete chapters show star badge (FR-36)
  - [ ] 6.5 Verify Review Mistakes collects words with wrongCount>0 AND stage!=='mastered' (FR-34)
  - [ ] 6.6 Verify Review Mistakes pulls from ALL chapters (FR-34)

- [ ] 7.0 Add Missing PRD Features and Polish
  > Implement any missing features including keyboard shortcuts verification, session celebration screen, and placeholder text consistency.
  - [ ] 7.1 Verify keyboard shortcuts in Learn mode: Space/Enter=flip, ArrowLeft/n=wrong, ArrowRight/y=correct (FR-41)
  - [ ] 7.2 Verify keyboard shortcut in typing modes: Enter=submit (FR-42)
  - [ ] 7.3 Verify close/X button navigates back to home or chapter (FR-43)
  - [ ] 7.4 Verify mode labels with correct colors: Learn=blue, Listen=purple, Produce=green (FR-44)
  - [ ] 7.5 Verify celebration screen shows: party emoji, "Session complete!", review count, two buttons (FR-45)
  - [ ] 7.6 Verify progress bar at top: w-24 h-2 bg-gray-200 rounded-full, green fill (FR-27, FR-28, FR-29)
  - [ ] 7.7 Verify Check button disabled when input empty (FR-26)
  - [ ] 7.8 Verify correct feedback shows "Correct!" in green #58CC02 (FR-27)
  - [ ] 7.9 Verify wrong feedback shows "It was: [answer]" in red #FF4B4B (FR-28)
  - [ ] 7.10 Verify auto-advance to next card after 1500ms (FR-30)

---

## Relevant Files

- `src/pages/TrackReview.tsx` - Chapter-specific review with stage selection (Learn/Listen/Produce modes)
- `src/pages/Review.tsx` - Today's practice review page (all 900 words progression)
- `src/pages/Tracks.tsx` - Chapter selection grid (42 chapters)
- `src/pages/TrackDetail.tsx` - Individual chapter detail with stage buttons
- `src/pages/Today.tsx` - Home page with practice mode buttons and stats
- `src/lib/audio.ts` - Web Speech API wrapper for Dutch pronunciation
- `src/lib/db.ts` - Dexie database schema and helpers
- `src/store/index.ts` - Zustand store with global state and actions
- `src/types/index.ts` - TypeScript type definitions
- `src/data/chapters.ts` - Chapter and word data
- `tasks/PRD-dutch900-full-spec.md` - Source of truth PRD document

---

*Ready to begin verification. Awaiting permission to start with Task 1.1.*
