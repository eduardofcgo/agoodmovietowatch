const os = require("os")
const fs = require("fs")
const path = require("path")
const assert = require("assert")

const agoodmovietowatch = require("./agoodmovietowatch")
const feed = require("./feed")

const pageUrl = page => `https://agoodmovietowatch.com/all/page/${page}/`

const getTotalPages = () => agoodmovietowatch.countPages(pageUrl(1))

const download = async () => {
  const totalPages = await getTotalPages()

  const urls = []
  for (let page = 1; page <= totalPages; page++) urls.push(pageUrl(page))

  const moviesPages = await Promise.all(urls.map(agoodmovietowatch.scrape))

  return moviesPages.flat()
}

const getFeed = async () => {
  const movies = (await download()).map(m => feed.stevenLu(key, m))
  const matched = (await Promise.all(movies)).filter(m => m !== undefined)

  const unrecognizableMovies = movies.length - matched.length

  console.log("Unrecognized", unrecognizableMovies, "movies out of", movies.length)

  assert(unrecognizableMovies / movies.length < 0.5)

  return matched
}

const args = process.argv.slice(2)
assert(args.length == 1)

const filePath = args[0]
const key = process.env.OMDB_API
assert(key)

const writeFeed = movies => {
  fs.mkdirSync(filePath, { recursive: true })
  
  const pathAll = path.join(filePath, "stevenlu.json")
  const pathLatest = path.join(filePath, "stevenlu-latest.json")

  assert(!fs.existsSync(pathAll) && !fs.existsSync(pathLatest))

  const latestMovies = movies.slice(0, 12)

  fs.writeFileSync(pathAll, JSON.stringify(movies, null, 2))
  fs.writeFileSync(pathLatest, JSON.stringify(latestMovies, null, 2))
}

getFeed()
  .then(writeFeed)
  .catch(e => {
    console.error(e)

    process.exit(1)
  })
