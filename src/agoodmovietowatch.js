const request = require("request-promise")
const cheerio = require("cheerio")

const get = url =>
  request({
    uri: url,
    transform: cheerio.load
  })

const countPages = async movieListUrl => {
  const $ = await get(movieListUrl)

  const $pageNumbers = $(".page-numbers").contents()

  return Number($pageNumbers.last().text())
}

const scrape = async movieListUrl => {
  const $ = await get(movieListUrl)

  const movies = $(".content-title-single")
    .toArray()
    .map(e => {
      const url = e.attribs.href

      return {
        name: e.attribs.title,
        year: url.slice(url.length - 5, url.length - 1)
      }
    })

  return movies
}

module.exports = {
  countPages,
  scrape
}
