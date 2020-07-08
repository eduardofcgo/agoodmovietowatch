const imdb = require("imdb-api")

const client = key => {
  return new imdb.Client({ apiKey: key })
}

const stevenLu = async (key, movie) => {
  const { name, year } = movie
  const englishName = name.replace(/ *\([^)]*\) */g, "")
  const params = { name: englishName, type: "movie", year }

  try {
    const imdbMovie = await client(key).get(params)

    return {
      title: imdbMovie.title,
      imdb_id: imdbMovie.imdbid,
      poster_url: null
    }
  } catch (e) {
    // api only provides this error...
    if (e instanceof imdb.ImdbError) {
      console.log(e)
      return undefined
    } else throw e
  }
}

module.exports = {
  stevenLu
}
