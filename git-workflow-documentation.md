# Collaborative Git Workflow: Squash Merge and Rebase Strategy

## Overview

This document outlines our team's Git workflow, designed to maintain a clean, understandable project history while supporting collaborative development.

## Workflow Principles

- Maintain a clean, linear history on the `master` branch
- Use developer-specific integration branches
- Employ squash rebasing to eliminate nonsense commits
- Utilize rebasing to keep branches up-to-date

## Repository Setup

### Initial Repository Configuration

1. **Clone the Repository**
   ```bash
   git clone [SSH or HTTPS GitHub git url]
   cd your-project
   ```

2. **Create Developer Integration Branches**
   ```bash
   # Ensure you're on master branch and that it is up to date
   git checkout master
   git pull origin master

   # Create Ashton's developer branch
   git checkout -b dev-ashton
   git push -u origin dev-ashton

   # Create Brandon's developer branch
   git checkout master
   git checkout -b dev-brandon
   git push -u origin dev-brandon
   ```

## Developer Workflow

### Feature Development Process 

1. **Make sure developer branch is up to date**
   ```bash
   # Switch to developer branch
   git checkout dev-ashton
   
   # Get remote changes for all branches on the remote
   git fetch origin
   
   # Update your dev branch from the remote master
   git rebase origin/master
   ```

2. **Create a feature branch to work on**
   ```bash
   # Switch to developer branch (if not already on it)
   git checkout dev-ashton

   # Create feature branch
   git checkout -b ashton-feature-login
   ```
   
3. **Work on the feature and commit as you go**
   ```bash
   git add .
   git commit -m "Implement initial login authentication"
   git commit -m "Add password reset logic"
   git add .
   git commit -m "Add password validation logic"
   git add .
   git commit -m "Create error handling for login process"
   ```

### Prepare the feature for merging

4. **Make sure developer branch is up to date again**
   ```bash
   # Switch to developer branch
   git checkout dev-ashton
   
   # Get remote changes for all branches on the remote
   git fetch origin
   
   # Update dev branch from the remote master, so that it is up to date
   git rebase origin/master
   ```
   
5. **Rebase and Squash your feature branch**
   ```bash
   # Switch to feature branch
   git checkout ashton-feature-login
   
   # Rebase it against the developer branch, squashing where necessary
   git rebase -i dev-ashton
   ```
   
   Note that at the end of the rebase operation, you will be able to craft a final commit message for the new, squashed commit. Using `squash` in the interactive editor will preserve the individual commit messages on each commit so you can use them at the end.
   
6. **Merge your feature branch into your developer branch**
   ```bash
   # Switch to your developer branch
   git checkout dev-ashton
   
   # Merge the feature into the developer branch
   git merge ashton-feature-login
   ```
   
### Incorporate the feature into the production branch
   
7. **Push your developer branch to the remote**
   ```bash
   # Switch to the developer branch (If not on it already)
   git checkout dev-ashton
   
   # Push the branch to the remote repository
   git push origin dev-ashton
   
   # If you’ve already pushed your branch and need to update it, the above command will fail. Since a rebase rewrites commit history, you will no longer have a common commit on your branch and must use the --force option to instruct Git to discard the branch on your remote:
   git push --force origin dev-ashton
   ```

8. **Open a pull request**
   Open up GitHub in the browser or open the repository in GitHub Desktop so that you can merge the developer branch into the master branch on the remote
   
   * Make sure you select the **Squash and merge** option on the pull request to create a fast forward merge

## Best Practices

### Commit Message Guidelines

1. **First Line**: Brief, high-level description (50 characters or less)
2. **Body**: 
   - Explain *why* the change was made
   - Describe key modifications
   - Reference related issues if applicable
3. **Use Imperative Mood**: 
   - "Add feature" instead of "Added feature"
   - "Fix bug" instead of "Fixed bug"

### Workflow Tips

- Communicate with team about ongoing work
- Keep feature branches small and focused
- Regularly pull from `master` to minimize merge conflicts
- Review code before merging

## Common Workflow Scenarios

### Switching Between Features
```bash
# Stash current work
git stash

# Switch branches
git checkout another-branch

# Reapply stashed changes when ready
git stash pop
```

### Abandoning a Feature Branch
```bash
# Discard local branch
git branch -D feature-branch

# Remove remote branch
git push origin --delete feature-branch
```

## Potential Challenges

- Rebasing rewrites commit history
- Requires team discipline
- Potential for merge conflicts

## Learning Resources

- [Git Official Documentation](https://git-scm.com/docs)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)
- [GitHub Git Guides](https://github.com/git-guides)
