# The Comments Problem 💬

Github has [neat statistics](https://github.com/facebook/react/graphs/contributors) for contributors, it shows number of commits and nice charts. But people contribute to Github projects not only via commits. Actually, a lot of contributions happens in issue or pull request comments 💬. Github doesn't have statistics to show "top commenters". We think those people also deserve recognition.

## Main Task

You would need to fetch all existing comments for a given repository _till the API limit is exhausted_, group by user and output it sorted by number of comments. Here is how we will execute your program and how output should look like:

```bash
node index.js --repo anton/test-project

3012 comments, michael.davidovich (20 commits)
   8 comments, Restuta (234 commits)  
```

Please use the exact output format, notice that numbers are aligned _(this is what [famous](http://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm) left-pad is for)_. Also it's up to you how to indicate progress of the fetching process, but there must be some indicator.

Comments can be accessed using the following API endpoint:

- [Get Commit Comments](https://developer.github.com/v3/repos/comments/#list-commit-comments-for-a-repository)

You probably noticed in a sample output that after each name there is number of commits, here is an API to help fetch that:

- [Get Statistics Per Collaborator](https://developer.github.com/v3/repos/statistics/#get-contributors-list-with-additions-deletions-and-commit-counts)

Use "total", we don't care for commits to match a date range, we just want all of them.

## Requirements

* `--repo` parameter is mandatory.
* Focus on making code readable.
* Over-communicate.
* Create small, focused commits.
* Test your code with repositories of different sizes.
* Please check how to use [Eslint](https://eslint.org/docs/user-guide/getting-started)
* Just like with about any API respect [Github's rate limits.](https://developer.github.com/v3/rate_limit/) Handle errors when limit is exceeded. Reflect remaining limits in progress indicator. Make sure you don't hit [abuse limits](https://developer.github.com/v3/guides/best-practices-for-integrators/#dealing-with-abuse-rate-limits).
* Feel free to use any packages, except ones that wrap Github API. You have to use their API natively for this challenge.
* All packages must be installed in `package.json`, so you project will be runnable out of the box.


## Setup

We provide a basic project setup, so you don't have to worry about setting up our environment. You would need to obtain and use your personal access token.

[Create personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/), save it, and then use it to access API to get 5000 requests/hour.

To get started:

- install node 8.9
- fork this repository (it will be  a private fork, nobody will be able to see it)
- `cd` into repository directory
- run `npm install`
- create `src/token/__do-not-commit-me__.js` file and add your token there like that:
```js
module.exports = '<token>'
```
- run `npm start`
- make sure you see the following output
```bash
Your github token is:
<your token>
<details of your github account>
```
You can remove this entry code afterwards. Mentioned file is added to `.gitignore` already.
- run `npm run dev`, this will start development server (nodemon) that monitors your changes and re-runs the script for faster development cycle
- see `example.js` for how it's done, have fun :tada:

## When you are done
Run `npm run eslint:fix` and fix all issues. Commit and push those fixes. Email us a link to your fork.
