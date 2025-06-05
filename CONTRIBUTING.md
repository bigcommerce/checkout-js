# Contributing to Checkout JS

Thanks for showing interest in contributing!

The following is a set of guidelines for contributing to checkout-js. These are just guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.


## Pulling Updates from Master

### Fork Setup (First Time Only)

```bash
# Fork the repository on GitHub first, then clone your fork
git clone https://github.com/YOUR_USERNAME/checkout-js.git
cd checkout-js

# Add the original repository as upstream
git remote add upstream https://github.com/bigcommerce/checkout-js.git

# Verify remotes
git remote -v
```

### Basic Update Process

```bash
# Switch to master branch
git checkout master

# Pull latest changes from upstream
git pull upstream master

# Push updates to your fork
git push origin master

# Switch back to your feature branch
git checkout your-feature-branch

# Merge or rebase master into your branch
git merge master
# OR
git rebase master

# Push updated feature branch to your fork
git push origin your-feature-branch
```

### Alternative: Rebase Strategy

For a cleaner history:

```bash
git checkout your-feature-branch
git rebase master

# If conflicts occur during rebase
git add .
git rebase --continue
```

### Best Practices

- **Pull frequently** from upstream to minimize conflicts
- **Create backup branch** before major merges: `git checkout -b backup-branch`
- **Use merge for shared branches**, rebase for personal feature branches
- **Test after merging** to ensure everything still works
- **Keep your fork's master in sync** with upstream

### Contributing Your Changes

When your feature is ready:

```bash
# Ensure your branch is up to date with upstream master
git checkout master && git pull upstream master && git checkout your-feature-branch && git merge master

# Push your feature branch to your fork
git push origin your-feature-branch

# Create a pull request through GitHub UI from your fork to the main repository
```

### Quick Commands

```bash
# Update current branch with latest upstream master
git checkout master && git pull upstream master && git checkout - && git merge master

# Rebase current branch with upstream master
git checkout master && git pull upstream master && git checkout - && git rebase master
```

## Other Ways to Contribute

- Consider reporting bugs, contributing to test coverage, or helping spread the word about checkout-js.

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference pull requests and external links liberally
