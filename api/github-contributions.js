const USER = process.env.GITHUB_USER || 'Priyanshav';

module.exports = async function handler(request, response) {
  if (!process.env.GITHUB_TOKEN) {
    response.status(503).json({ error: 'Contribution data is temporarily unavailable' });
    return;
  }

  const days = Math.min(365, Math.max(1, Number(request.query.days) || 90));
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

  try {
    const githubResponse = await fetch('https://api.github.com/graphql', {
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

    const result = await githubResponse.json();
    if (!githubResponse.ok || result.errors || !result.data || !result.data.user) {
      throw new Error('GitHub contribution query failed');
    }

    const calendar = result.data.user.contributionsCollection.contributionCalendar;
    const daysData = calendar.weeks.flatMap((week) => week.contributionDays);
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    response.status(200).json({ total: calendar.totalContributions, days: daysData });
  } catch (error) {
    response.status(503).json({ error: 'Contribution data is temporarily unavailable' });
  }
}
