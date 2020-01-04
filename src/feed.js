const imdb = require("imdb-api")

const memoClient = function(key) {
  if (!this.client) this.client = {}
  if (!this.client[key]) this.client[key] = new imdb.Client({ apiKey: key })

  return this.client[key]
}

const stevenLu = async (key, movie) => {
  const { name, year } = movie
  const englishName = name.replace(/ *\([^)]*\) */g, "")

  let params
  try {
    params = { name: englishName, type: "movie", year }
    const imdbMovie = await memoClient(key).get(params)

    return {
      title: imdbMovie.title,
      imdb_id: imdbMovie.imdbid,
      poster_url: null
    }
  } catch (e) {
    console.error(e, movie, params)

    return undefined
  }
}

module.exports = {
  stevenLu
}
