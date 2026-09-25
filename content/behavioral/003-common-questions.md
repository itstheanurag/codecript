---
title: Common Questions & Scenarios
description: Learn how to answer the behavioral questions you will actually get, what interviewers are scoring, and how to map a small story bank onto many prompts.
order: 3
---

Most "tell me about a time" questions are the same five intents in different costumes. If you prepare the intent, you can reuse a story instead of inventing a new one on the spot.

Goal: **show, do not claim.** "I am a great collaborator" is empty. A disagreement, what you did, and the outcome is a signal.

> [!TIP]
> **ELI5: The exam has a rubric**
> They are not collecting fun anecdotes. Each question is a box on a score sheet: conflict, failure, initiative, influence, motivation. Your job is to drop evidence in the box, then stop.

## 1. Conflict with a coworker

**Intent:** Can you disagree without becoming the problem?

**Wrong:** Never had a conflict. Or: they were an idiot, I won.

**Right:** A *professional* disagreement (API shape, launch date, on-call load). You listened, you brought data, you changed your mind *or* you committed after being overruled.

**Traits:** empathy, specificity, no character assassination.

**Follow-ups they will ask:** "What did they think of you after?" "Would you do the same again?"

Sketch: "I wanted a sync REST call; they wanted a queue. I was wrong about peak load. We shipped the queue; I wrote the consumer. p99 stayed under 200ms on Black Friday."

## 2. Greatest failure

**Intent:** Do you own mistakes, or do you narrate other people's?

**Wrong:** "I'm a perfectionist." Or a failure with no change afterward.

**Right:** You caused it (or a large share). You mitigated. You installed a **system** so it cannot recur (test, alert, checklist, design review).

**Traits:** ownership, calibration, no self-flagellation theater.

Never pick a story that makes you look careless with user data unless you can show a serious process change. Interviewers still have to sleep at night.

## 3. Took initiative / leadership without title

**Intent:** Do you move the team, or only your ticket?

**Wrong:** Doing your assigned Jira well.

**Right:** A problem that was nobody's job: flaky CI, missing runbook, a junior drowning, a cost spike. You aligned people, you shipped the fix, you left it owned.

**Traits:** scope, influence, finishing.

Initiative that created extra work for everyone with no buy-in scores **negative**. Leadership includes "I stopped after two people said no, and I was right to."

## 4. Difficult stakeholder

**Intent:** Influence without authority. Product, sales, another team, a founder.

**Wrong:** "PMs don't understand engineering."

**Right:** Their incentive (launch date, revenue, a customer). You made the trade-off visible (risk, hours, quality). You offered options, not a lecture. You stayed aligned after the decision.

**Traits:** communication, negotiation, respect for their metric.

## 5. Why this company?

**Intent:** Did you do homework, or is this spray-and-pray?

**Wrong:** Comp, brand, "you're a market leader."

**Right:** One product decision, one engineering blog, one problem they are clearly solving — tied to what you want to work on next. Two minutes of research beats a paragraph of flattery.

If you cannot name a product surface, you are not ready for that onsite.

## 6. Ambiguity ("not enough requirements")

**Intent:** Can you ship without a perfect spec?

Show: you listed unknowns, you picked a default, you time-boxed a spike, you confirmed with the stakeholder, you documented the decision. "I waited for a perfect PRD" is a no-hire for senior roles.

## Story bank grid

Reuse. One outage story can be technical depth *or* failure *or* leadership depending on which STAR slice you emphasize.

| Story | Conflict | Failure | Leadership | Technical |
| :--- | :---: | :---: | :---: | :---: |
| Payment gateway TLS outage | | | X | X |
| Mentoring a junior through a bad review | | | X | |
| API design disagreement | X | | | X |
| Migration that locked prod | | X | | X |
| Stakeholder wanted to skip rate limits | X | | X | |

Write **one sentence per filled cell** from your own career before the interview week. If a cell is empty, you have a gap; go find a smaller real story, do not invent a war.

> [!NOTE]
> When they ask a question you already used a story for, say so and offer a second: "I used the TLS outage for failure; for conflict I have the API review." Repeating the same hero narrative three times looks like a thin career.

## What to remember

- Map questions to intents, then to stories, not to memorized scripts.
- Strong answers include a trade-off, your actions, and a result someone else could verify.
- Empty cells in the grid are practice homework, not a mystery on the day.
