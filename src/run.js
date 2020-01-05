const os = require("os")
const fs = require("fs")
const path = require("path")
const assert = require("assert")

const agoodmovietowatch = require("./agoodmovietowatch")
const feed = require("./feed")

const url = {
  best: page => `https://agoodmovietowatch.com/tag/best/page/${page}/?sort=toprated`,
  latest: page => `https://agoodmovietowatch.com/all/page/${page}/`
}

const getTotalPages = async () => ({
  best: await agoodmovietowatch.countPages(url.best(1)),
  latest: await agoodmovietowatch.countPages(url.latest(1))
})

const download = async () => {
  const totalPages = await getTotalPages()

  const urls = []
  for (let page = 1; page <= totalPages.latest; page++) urls.push(url.latest(page))
  for (let page = 1; page <= totalPages.best; page++) urls.push(url.best(page))

  const moviesPages = await Promise.all(urls.map(agoodmovietowatch.scrape))

  return moviesPages.flat()
}

const deduplicate = movies => {
  const movieYears = {}

  movies.forEach(({ name, year }) => {
    if (!movieYears[name]) movieYears[name] = new Set()

    movieYears[name].add(year)
  })

  return Object.keys(movieYears)
    .map(name => Array.from(movieYears[name]).map(year => ({ name, year })))
    .flat()
}

const write = async folder => {
  fs.mkdirSync(folder, { recursive: true })

  const pathAll = path.join(folder, "stevenlu.json")
  const pathLatest = path.join(folder, "stevenlu-latest.json")

  assert(!fs.existsSync(pathAll) && !fs.existsSync(pathLatest))

  const movies = deduplicate(await download())
  const stevenLu = movies.map(m => feed.stevenLu(key, m))
  const matchedStevenLu = (await Promise.all(stevenLu)).filter(m => m !== undefined)

  const unrecognizableMovies = movies.length - matchedStevenLu.length

  console.log("Unrecognized", unrecognizableMovies, "movies out of", movies.length)

  assert(unrecognizableMovies / movies.length < 0.5)

  const latestStevenLu = matchedStevenLu.slice(0, 12)

  fs.writeFileSync(pathAll, JSON.stringify(matchedStevenLu, null, 2))
  fs.writeFileSync(pathLatest, JSON.stringify(latestStevenLu, null, 2))
}

const args = process.argv.slice(2)
assert(args.length == 1)

const filePath = args[0]
const key = process.env.OMDB_API
assert(key)

write(filePath)
