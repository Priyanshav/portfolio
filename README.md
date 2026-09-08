# Priyanshu Kumar Portfolio

Personal portfolio website for Priyanshu Kumar, focused on software development,
cybersecurity, and AI-powered applications.

## Live Website

Visit the deployed portfolio at:

**https://priyanshukumar-rouge.vercel.app/**

## Overview

The portfolio presents professional experience, selected projects,
certifications, technical skills, and contact information in a responsive,
cybersecurity-inspired interface.

### Highlights

- Responsive layout for desktop, tablet, and mobile screens
- Animated loading screen, typing effects, scroll progress, particles, and cursor interactions
- Interactive 3D visual elements powered by Three.js
- Project, skills, certifications, resume, and contact sections
- GitHub contribution activity loaded through a protected serverless API
- GitHub and LeetCode statistics displayed in the portfolio
- Downloadable resume and certification documents in `assets/`

## Technology

- HTML5 for the page structure
- CSS3 for responsive styling, animations, themes, and visual effects
- Vanilla JavaScript for interactions and dynamic content
- Three.js for 3D scenes and card effects
- Vercel serverless functions for the GitHub contribution proxy
- GitHub GraphQL API for contribution calendar data

## Project Structure

```text
.
├── index.html                 # Main portfolio page
├── api/
│   └── github-contributions.js # GitHub contribution API proxy
├── assets/                    # Profile image, resume, and certificates
├── css/                       # Stylesheets and visual themes
├── js/                        # Portfolio interactions and 3D effects
└── vercel.json                # Vercel function configuration
```

## Run Locally

This is a static site, so it does not require a build step.

1. Clone the repository:

   ```bash
   git clone https://github.com/Priyanshav/portfolio.git
   cd portfolio
   ```

2. Start a local static server. For example, with Python:

   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` in a browser.

Opening `index.html` directly also works for the static frontend, but a local
server is recommended so that browser asset and API behavior matches deployment.

## Deploy With Vercel

1. Import the repository into Vercel.
2. Set the project root to the repository root.
3. Leave the build command empty because the site has no build step.
4. Deploy the project.

Vercel serves `index.html` as the frontend and automatically deploys
`api/github-contributions.js` as a serverless function.

### Environment Variables

Configure these variables in the Vercel project settings:

- `GITHUB_TOKEN` - Required. A GitHub token that can read the contribution calendar.
- `GITHUB_USER` - Optional. GitHub username to query; defaults to `Priyanshav`.

The token is used only by the serverless function and is never sent to the
browser. The endpoint accepts an optional `days` query parameter, limited to a
range of 1 to 365 days, and caches successful responses for one hour.

## License

This repository is a personal portfolio project. Contact the author before
reusing portfolio content, images, resume files, or certificates.
