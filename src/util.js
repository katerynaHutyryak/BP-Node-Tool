function throwApiLimitError(err) {
  if (
    err.response &&
    err.response.status === 403 &&
    err.response.headers['x-ratelimit-remaining'] === 0
  ) {
    throw Error('API call limit is exceeded')
  }
}

module.exports = throwApiLimitError
