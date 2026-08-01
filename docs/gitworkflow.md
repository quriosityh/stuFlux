# Git Workflow Notes — Protected `develop` Branch (Full Module)

> [!info] Context
> `develop` is now protected → no direct pushes allowed. All changes must go through a **Pull Request (PR)** with required reviews/checks passing.

---

## 1. What "Protected Branch" Changes

| Before (unprotected) | Now (protected) |
|---|---|
| `git merge` + `git push origin develop` locally | ❌ Blocked — GitHub rejects direct push |
| Merge whenever ready | ✅ Must open PR → pass checks/review → merge via GitHub UI |
| Force push allowed | ❌ Force push disabled on `develop` |
| Delete branch directly | Merge button handles it, or manual delete after |

> [!warning] Trying to push directly to a protected branch
> ```
> ! [remote rejected] develop -> develop (protected branch hook declined)
> ```
> This is expected — it means protection is working. Use a PR instead.

---

## 2. Full Feature Branch Workflow (Start → Merge)

### Step 1 — Sync develop locally
```bash
git checkout develop
git pull origin develop
```

### Step 2 — Create feature branch
```bash
git checkout -b feature/short-description
```

### Step 3 — Work + commit
```bash
git add .
git commit -m "Add availability calendar component"
```

### Step 4 — Push feature branch (first time)
```bash
git push -u origin feature/short-description
```

### Step 5 — Open PR
- Go to GitHub → "Compare & pull request"
- Base: `develop` ← Compare: `feature/short-description`
- Fill in: what changed, why, screenshots if UI
- Assign reviewer (your FYP partner)

### Step 6 — Wait for checks/review
- CI checks (if configured) must pass
- Reviewer approves or requests changes

### Step 7 — Merge via GitHub UI
- Use **"Squash and merge"** (clean single commit) or **"Create a merge commit"** (keeps history) — pick one convention and stick to it for the whole project
- GitHub deletes the remote branch automatically (if enabled) or click "Delete branch"

### Step 8 — Clean up locally
```bash
git checkout develop
git pull origin develop
git branch -d feature/short-description
```

---

## 3. Addressing PR Review Comments

> [!tip] Reviewer requested changes
```bash
# stay on the same feature branch
git add .
git commit -m "Address review: fix calendar timezone bug"
git push origin feature/short-description
```
No need to reopen the PR — pushing to the same branch updates it automatically.

---

## 4. Keeping Feature Branch in Sync with develop

Do this **before opening PR** and **anytime develop moves ahead** while you're mid-work:

```bash
git checkout develop
git pull origin develop
git checkout feature/short-description
git merge develop
```

- Resolve conflicts locally → commit → push
- Keeps your PR's diff clean and mergeable

> [!note] Alternative: rebase (cleaner history, more advanced)
> ```bash
> git checkout feature/short-description
> git rebase develop
> # resolve conflicts if any
> git push --force-with-lease origin feature/short-description
> ```
> Only rebase if you're comfortable with force-pushing your **own** feature branch (never rebase/force-push `develop` or `main` — protected anyway).

---

## 5. Resolving Merge Conflicts (PR blocked by conflicts)

If GitHub shows "This branch has conflicts that must be resolved":

```bash
git checkout feature/short-description
git checkout develop -- .        # NOT this, just for reference
git merge develop
# Git marks conflicted files with <<<<<<< ======= >>>>>>>
# open each file, manually resolve
git add <resolved-files>
git commit
git push origin feature/short-description
```
PR updates automatically once pushed.

---

## 6. Hotfix Workflow (bug in main/production)

```bash
git checkout main
git pull origin main
git checkout -b hotfix/fix-login-crash

# fix + commit
git add .
git commit -m "Fix login crash on empty token"
git push -u origin hotfix/fix-login-crash
```
- Open **two PRs**: `hotfix/... → main` AND `hotfix/... → develop`
- Merge both after review, so the fix isn't lost when `develop` later merges into `main`

---

## 7. Release Workflow (develop → main)

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0
# final testing/tweaks only, no new features here
git push -u origin release/v1.0
```
- Open PR: `release/v1.0 → main`
- After merge, tag it:
```bash
git checkout main
git pull origin main
git tag -a v1.0 -m "FYP milestone 1"
git push origin --tags
```
- Also merge `release/v1.0 → develop` (via PR) to sync any release-only fixes back

---

## 8. Quick Reference Table

| Situation | Command/Action |
|---|---|
| Start new feature | `git checkout -b feature/x` from updated `develop` |
| First push of new branch | `git push -u origin feature/x` |
| Push direct to develop | ❌ Not allowed — open PR |
| Sync feature with develop | `git merge develop` (on feature branch) |
| Update PR after review | Commit + `git push` to same branch |
| Conflicts blocking PR | Merge `develop` locally, resolve, push |
| Bug in production | `hotfix/*` branch from `main`, PR into both `main` and `develop` |
| Ready to release | `release/*` branch from `develop`, PR into `main`, tag it |
| Clean up after merge | `git branch -d feature/x` (local), GitHub auto-deletes remote |

---

## 9. Common Errors Cheat Sheet

| Error | Meaning | Fix |
|---|---|---|
| `protected branch hook declined` | Direct push blocked | Use PR instead |
| `no upstream branch` | New local branch, no remote yet | `git push -u origin branch-name` |
| `Updates were rejected... non-fast-forward` | Remote has commits you don't | `git pull` (or `merge`) before pushing |
| `This branch has conflicts` (GitHub UI) | Feature and develop diverged | Merge `develop` in locally, resolve, push |
| PR shows "Required checks failing" | CI/tests not passing | Fix code, push again — PR auto-updates |

---

Want me to also add a **PR description template** (for consistency with your partner) or a **branch naming convention section** for StuFlux specifically?