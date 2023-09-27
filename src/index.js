const axios = require('axios')

const config = require('./config')

const [owner, repo] = process.argv[3].split('/')
const apiBase = 'https://api.github.com'

const commentsArray = []
const commitsArray = []

async function fetchCommitComments () {
    let response
    let page = 1
    do {
        try{
            response = await axios.get(`${apiBase}/repos/${owner}/${repo}/comments?per_page=100&page=${page}`, {
                headers: {
                    Authorization: `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`,
                    'X-GitHub-Api-Version': '2022-11-28' 
                }
            })
        } catch (err) {
            console.log(err)
        }
        commentsArray.push(...response.data)    
        page++
    } while (response.data.length === 100)
}

fetchCommitComments()