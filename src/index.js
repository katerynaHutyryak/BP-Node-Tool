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
    const userCommitData = {}

    comments.forEach(el => {
        const userName = el.user.login
        if(!userCommitData[userName]) {
            userCommitData[userName] = {
                commentsNum : 1,
                commits : 0
            }
        } else {
            userCommitData[userName].commentsNum += 1
        }
    })

    commits.forEach(el => {
        const userName = el.author.login
        if(userCommitData[userName]) {
            userCommitData[userName].commits = el.total
        } else {
            userCommitData[userName] = {
                commentsNum : 0,
                commits : el.total
            }
        }
    })
    return userCommitData
}


async function main() {
    try{
        const comments = await fetchCommitComments()
        const commits = await fetchCommits()
        const userCommitData = processFetchedData(comments, commits)
        return userCommitData
    } catch (err) {
        console.log(err)
    }
}

main().then(userCommitData => {
    const userCommitArray = Object.entries(userCommitData)
    userCommitArray.sort((a, b) => b[1].commentsNum - a[1].commentsNum)
    .forEach(([username, userData]) => {
        console.log(`${userData.commentsNum} comments, ${username} (${userData.commits} commits)`)
    })
}).catch(err => {
    console.log(err)
})