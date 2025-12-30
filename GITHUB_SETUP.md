# GitHub Setup Checklist

This document outlines the steps to prepare and transfer this app to GitHub.

## ✅ Pre-Transfer Checklist

### 1. Environment Variables
- [x] `.env.example` created with template variables
- [x] `.gitignore` updated to exclude `.env*` files
- [x] No API keys hardcoded in source code

### 2. Build Artifacts
- [x] `dist/` directory excluded in `.gitignore`
- [x] `node_modules/` excluded in `.gitignore`
- [x] `package-lock.json` included (for consistent installs)

### 3. Documentation
- [x] `README.md` updated with setup instructions
- [x] Environment variables documented
- [x] Installation steps clear
- [x] Deployment instructions included

### 4. GitHub-Specific Files
- [x] `.github/ISSUE_TEMPLATE/` created for bug reports and feature requests
- [x] `.github/workflows/ci.yml` created for CI/CD
- [x] `.gitignore` optimized for GitHub

### 5. Replit-Specific Files
- [x] `.replit` excluded in `.gitignore`
- [x] `.replit_integration_files/` excluded in `.gitignore`
- [x] Replit-specific code documented in README

## 🚀 Transfer Steps

1. **Create GitHub Repository**
   ```bash
   # On GitHub, create a new repository
   # Don't initialize with README, .gitignore, or license
   ```

2. **Initialize Git (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DreamShift app"
   ```

3. **Add Remote and Push**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

4. **Set Repository Secrets (if using GitHub Actions)**
   - Go to Settings → Secrets and variables → Actions
   - Add `GEMINI_API_KEY` as a repository secret (if needed for CI)

5. **Verify .gitignore is Working**
   ```bash
   git status
   # Should NOT show:
   # - .env.local
   # - .env
   # - node_modules/
   # - dist/
   # - .replit
   # - .replit_integration_files/
   ```

## 🔒 Security Reminders

- ✅ Never commit `.env` or `.env.local` files
- ✅ Never commit API keys or secrets
- ✅ Review all files before first commit: `git status`
- ✅ Use GitHub Secrets for CI/CD environment variables

## 📝 Post-Transfer Tasks

1. Update README with actual repository URL
2. Add repository description on GitHub
3. Add topics/tags (e.g., `react`, `typescript`, `vite`, `ai`, `career`)
4. Enable GitHub Pages (if needed for documentation)
5. Set up branch protection rules (if working with team)
6. Configure GitHub Actions secrets (if using CI/CD)

## 🐛 Troubleshooting

### If sensitive files were already committed:
```bash
# Remove from git history (use with caution)
git rm --cached .env.local
git commit -m "Remove sensitive files"
```

### If build fails in CI:
- Check Node.js version matches local
- Verify all dependencies are in `package.json`
- Check for platform-specific code

## 📚 Additional Resources

- [GitHub Documentation](https://docs.github.com)
- [Git Ignore Patterns](https://git-scm.com/docs/gitignore)
- [GitHub Actions](https://docs.github.com/en/actions)

