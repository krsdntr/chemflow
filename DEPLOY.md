# Deploying ChemFlow to GitHub Pages

Since ChemFlow has been refactored to be **Serverless (100% Static)**, you can host it for free on GitHub Pages.

## Prerequisites
- A GitHub account.
- Git installed on your machine.
- Node.js installed.

## Step 1: Prepare the Code
1.  Open `d:\app\ChemFlow\frontend\vite.config.ts`.
2.  Add the `base` property with your repository name.
    ```typescript
    export default defineConfig({
      base: '/RepoName/', // Replace 'RepoName' with your actual repo name (e.g., '/chemflow/')
      plugins: [react()],
      // ...
    })
    ```
    *Note: If you are deploying to `username.github.io` (root domain), you can skip this step or use `base: '/'`.*

## Step 2: Push to GitHub
1.  Initialize git if you haven't:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Link it:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

## Step 3: Deploy using `gh-pages` script (Recommended)
This is the easiest method.

1.  **Install `gh-pages` tool**:
    ```bash
    cd frontend
    npm install gh-pages --save-dev
    ```

2.  **Add Deploy Script**:
    Open `frontend/package.json` and add these scripts:
    ```json
    "scripts": {
      "predeploy": "npm run build",
      "deploy": "gh-pages -d dist",
      // ... other scripts
    }
    ```

3.  **Run Deploy**:
    ```bash
    npm run deploy
    ```

4.  **Done!** Your app will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`.

## Manual Method (Alternative)
1.  Run `npm run build` in the `frontend` directory.
2.  The output is in the `dist` folder.
3.  Upload the contents of `dist` to your hosting provider (GitHub Pages manually, Vercel, Netlify, etc.).
