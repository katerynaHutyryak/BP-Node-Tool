const axios = require('axios')
const cliProgress = require('cli-progress')

const config = require('./config')
const throwApiLimitError = require('./util')

const [owner, repo] = process.argv[3].split('/')
const apiBase = 'https://api.github.com'
const axiosConfig = {
  headers: {
    Authorization: `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
  },
}

async function fetchCommitComments() {
  let response
  let page = 1
  const commentsArray = []
  do {
    try {
      response = await axios.get(
        `${apiBase}/repos/${owner}/${repo}/comments?per_page=100&page=${page}`,
        axiosConfig,
      )
    } catch (err) {
      throwApiLimitError(err)
    }
    commentsArray.push(...response.data)
    page++
  } while (response.data.length === 100)
  return commentsArray
}

async function fetchCommits() {
  try {
    const response = await axios.get(
      `${apiBase}/repos/${owner}/${repo}/stats/contributors`,
      axiosConfig,
    )
    return response.data
  } catch (err) {
    throwApiLimitError(err)
  }
}

function processFetchedData(comments, commits) {
  const userCommitData = {}

  comments.forEach(el => {
    const userName = el.user.login
    if (!userCommitData[userName]) {
      userCommitData[userName] = {
        commentsNum: 1,
        commits: 0,
      }
    } else {
      userCommitData[userName].commentsNum += 1
    }
  })

  commits.forEach(el => {
    const userName = el.author.login
    if (userCommitData[userName]) {
      userCommitData[userName].commits = el.total
    } else {
      userCommitData[userName] = {
        commentsNum: 0,
        commits: el.total,
      }
    }
  })
  return userCommitData
}

async function fetchApiLimits() {
  const response = await axios.get(`${apiBase}/rate_limit`, axiosConfig)
  const { remaining: remainingCalls } = response.data.resources.core

  console.log(`\n${remainingCalls} API calls left\n`)

  if (remainingCalls <= 0) {
    const resetTime = new Date(response.headers['x-ratelimit-reset'] * 1000)
    const now = new Date()
    const timeToWait = Math.floor((resetTime - now) / 1000 / 60)
    throw Error(`API limit is exceeded. Please, return in ${timeToWait} min`)
  }
}

const progressBar = new cliProgress.SingleBar(
  {
    hideCursor: true,
    stopOnComplete: true,
  },
  cliProgress.Presets.shades_classic,
)

async function main() {
  await fetchApiLimits()

  progressBar.start(100, 0)
  progressBar.increment(10)

  const comments = await fetchCommitComments()

  progressBar.increment(20)

  const commits = await fetchCommits()

  progressBar.increment(30)

  const userCommitData = processFetchedData(comments, commits)

  progressBar.increment(100)

  const userCommitArray = Object.entries(userCommitData)
  userCommitArray
    .sort((a, b) => b[1].commentsNum - a[1].commentsNum)
    .forEach(([username, userData]) => {
      console.log(
        `${userData.commentsNum}`.padStart(2, ' ') +
          ` comments, ${username} (${userData.commits} commits)`,
      )
    })
}

main()
