const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 10000;
const ROOT = __dirname;
const USER = process.env.GITHUB_USER || 'Priyanshav';
const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

async function getContributions(url) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days')) || 90));
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days + 1);
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      'content-type': 'application/json',
      'user-agent': 'Priyanshav-portfolio'
    },
    body: JSON.stringify({
      query,
      variables: {
        login: USER,
        from: from.toISOString(),
        to: to.toISOString()
      }
    })
  });

  const result = await response.json();
  if (!response.ok || result.errors || !result.data || !result.data.user) {
    throw new Error('GitHub contribution query failed');
  }

  const calendar = result.data.user.contributionsCollection.contributionCalendar;
  const contributionDays = calendar.weeks.flatMap((week) => week.contributionDays);
  return { total: calendar.totalContributions, days: contributionDays };
}

function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(ROOT, `.${requested}`);
  if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'content-type': CONTENT_TYPES[extension] || 'application/octet-stream'
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/github-contributions') {
    try {
      sendJson(res, 200, await getContributions(url));
    } catch (error) {
      sendJson(res, 503, { error: 'Contribution data is temporarily unavailable' });
    }
    return;
  }
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Portfolio server listening on port ${PORT}`);
});
