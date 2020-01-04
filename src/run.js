const os = require("os")
const fs = require("fs")
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
  for (let page = 1; page <= totalPages.best; page++) urls.push(url.best(page))
  for (let page = 1; page <= totalPages.latest; page++) urls.push(url.latest(page))

  const moviesPages = await Promise.all(urls.map(agoodmovietowatch.scrape))

  return moviesPages.flat()
}

const write = async filePath => {
  assert(!fs.existsSync(filePath))

  const movies = Array.from(new Set(await download()))
  const stevenLu = movies.map(m => feed.stevenLu(key, m))
  const matchedStevenLu = (await Promise.all(stevenLu)).filter(m => m !== undefined)

  fs.writeFileSync(filePath, JSON.stringify(matchedStevenLu, null, 2))

  const unrecognizableMovies = movies.length - matchedStevenLu.length

  console.log("Unrecognized", unrecognizableMovies, "movies out of", movies.length)

  assert(unrecognizableMovies / movies.length < 0.5)
}

const args = process.argv.slice(2)
assert(args.length == 2)

const filePath = args[0]
const key = args[1]

write(filePath)
