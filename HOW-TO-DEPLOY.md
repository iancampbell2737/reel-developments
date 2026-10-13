# Reel Developments site: deploying to Netlify with "Publish changes"

This version lets you edit the site and click **Publish changes** so every visitor
sees your edits straight away. It needs Netlify Functions, so deploy it with
GitHub or the Netlify CLI (not by dragging a folder onto Netlify Drop).

## Option A: GitHub (recommended, no command line)
1. Create a free GitHub account and a new empty repository.
2. Upload every file and folder from this zip to the repository (drag and drop
   works on the GitHub website).
3. At app.netlify.com choose **Add new site > Import an existing project**,
   pick GitHub and your repository. Leave the build command empty. The publish
   directory is `.` (already set in netlify.toml). Click **Deploy**.

## Option B: Netlify CLI
    npm install -g netlify-cli
    cd <this folder>
    npm install
    netlify login
    netlify deploy --prod

## Set your passcode (important)
In Netlify: Site configuration > Environment variables > Add variable
- Key: `EDIT_PASSCODE`
- Value: your passcode (for example 173273, or a stronger one)
Then trigger a redeploy. If you skip this, 173273 is used.

## Using it
1. Open your site, click **Edit content** in the footer, enter the passcode.
2. Edit text, add or remove team photos.
3. Click **Publish changes** in the red bar. Do this on each page you edited.
   The page reloads and everyone now sees your changes.

Notes
- Published content is stored in Netlify Blobs (included with your site).
- Edits are saved per page, so click Publish on every page you changed.
- "Reset page" only undoes edits you haven't published yet.
