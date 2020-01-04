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

  const $titles = $("article.post").map(function() {
    const $this = $(this)

    const title =
      $this
        .find(".content-title")
        .text()
        .trim() ||
      $this
        .find(".entry-title")
        .text()
        .trim()

    return title
  })

  return $titles.toArray().filter(t => t !== "Subscriber-Only Suggestion")
}

module.exports = {
  countPages,
  scrape
}
