const imdb = require('imdb-api')


memoClient = function(key) {
	if (!this.client)
		this.client = {}
	if (!this.client[key])
		this.client[key] = new imdb.Client({apiKey: key})

	return this.client[key]
}

stevenLu = async (key, movie) => {
	const [name, year] = movie.split(", ")
	const englishName = name.replace(/ *\([^)]*\) */g, "")

	try {
		const params = {name: englishName, type: "movie", year}
		const imdbMovie = await memoClient(key).get(params)

		return {
			title: imdbMovie.title,
			imdb_id: imdbMovie.imdbid,
			poster_url: null
		}

	} catch(e) {
		console.error(e)

		return undefined
	}
}


module.exports = {
	stevenLu
}
