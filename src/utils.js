const cliProgress = require('cli-progress')

const progressBar = new cliProgress.SingleBar(
  {
    hideCursor: true,
    stopOnComplete: true,
    clearOnComplete: true,
  },
  cliProgress.Presets.shades_classic,
)

function throwApiLimitError(err) {
  if (
    err.response &&
    err.response.status === 403 &&
    err.response.headers['x-ratelimit-remaining'] === 0
  ) {
    const resetTimestamp = err.response.headers['x-ratelimit-reset'] * 1000
    throw Error(
      `API limit is exceeded. Try again in ${timeFromNow(resetTimestamp)} min`,
    )
  }
}

function timeFromNow(timestamp) {
  const future = new Date(timestamp)
  const now = new Date()
  return Math.floor((future - now) / 1000 / 60)
}

module.exports = { throwApiLimitError, progressBar, timeFromNow }
