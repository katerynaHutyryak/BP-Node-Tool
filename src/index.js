const axios = require('axios')
const URLSearchParams = require('url').URLSearchParams

const config = require('./config')
const { throwApiLimitError, progressBar, timeFromNow } = require('./utils')

const [owner, repo] = process.argv[3].split('/')
const BASE_URL = 'https://api.github.com'
const axiosConfig = {
  headers: {
    Authorization: `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
  },
}

async function fetchCommitComments() {
  const MAX_PER_PAGE = 100
  let response
  let page = 1
  const comments = []

  do {
    try {
      const searchParams = new URLSearchParams({
        per_page: MAX_PER_PAGE,
        page: page,
      }).toString()

      const url = `${BASE_URL}/repos/${owner}/${repo}/comments?${searchParams}`

      response = await axios.get(url, axiosConfig)
    } catch (err) {
      throwApiLimitError(err)
    }

    comments.push(...response.data)
    page++
  } while (response.data.length === MAX_PER_PAGE)

  return comments
}

async function fetchCommits() {
  try {
    const response = await axios.get(
      `${BASE_URL}/repos/${owner}/${repo}/stats/contributors`,
      axiosConfig,
    )
    return response.data
  } catch (err) {
    throwApiLimitError(err)
  }
}

function getUserCommitData(comments, commits) {
  const userCommitData = {}

  comments.forEach(comment => {
    const userName = comment.user.login
    if (!userCommitData[userName]) {
      userCommitData[userName] = {
        commentsNum: 1,
        commitsNum: 0,
      }
    } else {
      userCommitData[userName].commentsNum += 1
    }
  })

  commits.forEach(commit => {
    const userName = commit.author.login
    if (!userCommitData[userName]) {
      userCommitData[userName] = {
        commentsNum: 0,
        commitsNum: commit.total,
      }
    } else {
      userCommitData[userName].commitsNum = commit.total
    }
  })
  return userCommitData
}

async function fetchApiLimits() {
  const response = await axios.get(`${BASE_URL}/rate_limit`, axiosConfig)
  const { remaining: remainingCalls } = response.data.resources.core

  console.log(`\n${remainingCalls} API calls left\n`)

  if (remainingCalls <= 0) {
    const resetTimestamp = response.headers['x-ratelimit-reset'] * 1000
    throw Error(
      `API limit is exceeded. Try again in ${timeFromNow(resetTimestamp)} min`,
    )
  }
}

async function main() {
  await fetchApiLimits()

  progressBar.start(100, 0)
  progressBar.update(30)

  const [comments, commits] = await Promise.all([
    fetchCommitComments(),
    fetchCommits(),
  ])

  progressBar.update(60)

  const userCommitData = getUserCommitData(comments, commits)

  progressBar.update(100)

  const userCommitArray = Object.entries(userCommitData)
  userCommitArray
    .sort((a, b) => b[1].commentsNum - a[1].commentsNum)
    .forEach(([username, userData]) => {
      console.log(
        `${userData.commentsNum}`.padStart(2, ' ') +
          ` comments, ${username} (${userData.commitsNum} commits)`,
      )
    })
}

main()
