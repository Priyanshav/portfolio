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

The site is served by `server.js`, which also provides a small server-side proxy for
GitHub's GraphQL contribution calendar.

### Render deployment

Configure the Render service as a web service with:

- Build command: leave empty
- Start command: `npm start`
- Environment variable: `GITHUB_TOKEN` containing a GitHub token with API access
- Optional environment variable: `GITHUB_USER` (defaults to `Priyanshav`)

The token stays on the server and is never sent to the browser. Node.js 18 or newer
is required.
