const request = require("request-promise")
const cheerio = require("cheerio")

const get = url =>
  request({
    uri: url,
    transform: cheerio.load,
    timeout: 10000
  })

const countPages = async movieListUrl => {
  const $ = await get(movieListUrl)

  const $pageNumbers = $(".page-numbers")
    .not(".next")
    .last()

  return Number($pageNumbers.text())
}

const scrape = async movieListUrl => {
  const $ = await get(movieListUrl)

  const movies = []

  $(".content-title > a").each(function(i, e) {
    
    const url = $(e).attr("href")
    const year = url.slice(url.length - 5, url.length - 1)

    const title = $("span", e).text()

    movies.push({
      name: title, year
    })
  })

  return movies
}

module.exports = {
  countPages,
  scrape
}
