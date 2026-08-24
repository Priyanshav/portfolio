# Priyanshu Kumar Portfolio

A personal portfolio website built with HTML, CSS, and JavaScript showcasing projects, certifications, and cybersecurity skills.

## Live Demo

- https://priyanshav.onrender.com/

## About

This portfolio is hosted on Render and includes:

- animated UI interactions
- responsive design
- project highlights and certifications
- GitHub and LeetCode stats

## Deployment

The site is deployed on Vercel, with a serverless function providing a small
server-side proxy for GitHub's GraphQL contribution calendar.

### Vercel deployment

Import this repository into Vercel with the project root as the root directory.
No build command is required. Vercel serves `index.html` and automatically
deploys `api/github-contributions.js` as a serverless function.

Add this environment variable in Vercel:

- `GITHUB_TOKEN`: a GitHub token with API access
- Optional: `GITHUB_USER` (defaults to `Priyanshav`)

Redeploy after adding the variables. The token stays on the server and is never
sent to the browser.
