const axios = require('axios')

const config = require('./config')

const [owner, repo] = process.argv[3].split('/')
const apiBase = 'https://api.github.com'

async function fetchCommitComments () {
    let response
    let page = 1
    const commentsArray = []
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
    return commentsArray
}


async function fetchCommits () {
    try {
        const response = await axios.get(`${apiBase}/repos/${owner}/${repo}/stats/contributors`)
        return response.data
    } catch (err) {
        console.log(err)
    }
}


function processFetchedData (comments, commits) {
    const userCommitActivity = {}

    comments.forEach(el => {
        const userName = el.user.login
        if(!userCommitActivity[userName]) {
            userCommitActivity[userName] = {
                commentsNum : 1,
                commits : 0
            }
        } else {
            userCommitActivity[userName].commentsNum += 1
        }
    })

    commits.forEach(el => {
        const userName = el.author.login
        if(userCommitActivity[userName]) {
            userCommitActivity[userName].commits = el.total
        } else {
            userCommitActivity[userName] = {
                commentsNum : 0,
                commits : el.total
            }
        }
    })
}


async function main() {
    try{
        const comments = await fetchCommitComments()
        const commits = await fetchCommits()
        processFetchedData(comments, commits)
    } catch (err) {
        console.log(err)
    }
}
main()