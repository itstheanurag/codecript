---
title: The STAR Method
description: Learn how to structure behavioral answers as Situation, Task, Action, and Result, including a failure story that still has a measurable result.
order: 2
---

The STAR method is a structured manner of responding to a behavioral-based interview question by discussing the specific **S**ituation, **T**ask, **A**ction, and **R**esult of the situation you are describing.

## Breakdown of STAR

### 1. Situation (10%)
Set the scene and give the necessary details of your example. 
- **Goal**: Provide context.
- **Tip**: Keep it brief. Don't get bogged down in technical jargon that the interviewer might not know.

### 2. Task (10%)
Describe what your responsibility was in that situation.
- **Goal**: What was the challenge or goal?
- **Tip**: Define the specific problem you were trying to solve.

### 3. Action (60%)
Explain exactly what steps you took to address it.
- **Goal**: This is the most important part. Show your thinking process and your individual contribution.
- **Tip**: Use "I" instead of "We". Talk about the specific tools, conversations, or logic you used.

### 4. Result (20%)
Share what outcomes your actions achieved.
- **Goal**: Prove that your actions were effective.
- **Tip**: Use quantitave data (metrics, percentages) or qualitative data (feedback from manager, award) whenever possible.

---

## Detailed Example: Handling a Critical Bug

**Question**: "Tell me about a time you had to handle a high-pressure situation under a tight deadline."

### Situation
"During the final week before our holiday retail launch, our payment gateway started intermittently failing for users in Europe. It was Thursday, and the launch was scheduled for Monday morning."

### Task
"As the lead backend engineer for the payment service, my task was to identify the root cause, implement a fix, and ensure it was deployed without disrupting the 80% of users who were still able to checkout successfully."

### Action
"I first pulled the logs from our observability stack and noticed a timeout pattern specifically on the TLS handshake with the European bank's API. I realized the bank had updated their security certs and our legacy load balancer wasn't configured to trust the new CA. 
I quickly spun up a staging environment that mirrored the production traffic to test a configuration update. I also coordinated with the DevOps lead to prepare a canary deployment. Once I verified the fix in staging, I wrote a post-mortem draft while the staggered deployment was running to ensure we documented the missing alert that should have caught this sooner."

### Result
"The fix was fully deployed within 4 hours of the first error report. We saw 100% successful handshakes for European users immediately. More importantly, I implemented a new automated check for certificate expiry across all our third-party integrations, preventing this class of error from recurring. The holiday launch went off without a single payment failure reported."

---

## Failure stories still need a Result

**Question:** "Tell me about a mistake you made."

**Situation:** "I shipped a migration that added a `NOT NULL` column without a default on a 40M-row table."

**Task:** "I had to stop the incident, restore checkout, and make sure the next migration could not lock the table the same way."

**Action:** "I called for a freeze, rolled forward with a default in a follow-up deploy because rollback would have been worse, then added an expand/contract checklist to the PR template and a CI comment that fails on dangerous `ALTER`s."

**Result:** "Checkout recovered in 18 minutes. The next quarter we ran three large migrations with zero table-lock incidents. The mistake was mine; the system change is the result."

That is a hireable failure: **you owned it, you changed the system, you have a metric.**

> [!WARNING]
> Do not spend 70% of the time on Situation. Interviewers glaze over org charts. Cut context to two sentences. Action and Result are the product.

## Timing and follow-ups

Aim for **2 minutes**. If they want more, they will ask.

They will interrupt. That is good. Answer the interrupt, then return to Result so the story does not die in the middle of Action.

Keep a one-line prompt card per story (not a script): `EU payments TLS / 4h / cert check added`. Glance, then talk like a human.

## Pro-Tips for STAR
1. **Prepare 6 stories** across conflict, failure, leadership, ambiguity, technical depth, and stakeholders.
2. **The R is the hook.** Even in a failure, the result is the *system* you installed afterward.
3. **Quantify or name an artifact.** A dashboard, RFC, test, or runbook is evidence.
4. **STAR is a guide, not a teleprompter.** If they ask a narrow follow-up, do not restart from Situation.
