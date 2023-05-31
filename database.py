import sqlite3
import json
from datetime import datetime


conn = sqlite3.connect("agoodmovietowatch.db")
cursor = conn.cursor()

cursor.executescript(
    """
    create table if not exists movie(
        id integer primary key,
        slug text,
        type text,
        title text,
        thumbnail text,
        detailed_image text,
        creation_date integer,
        staff_rating integer,
        short_summary text,
        is_very_best integer,
        is_premium integer,
        wikilink text,
        imdb text,
        runtime text
    );
    """
)


def ensure_full_url(url):
    if url.startswith("http"):
        return url
    else:
        return "https://agoodmovietowatch.com" + url


with open("agoodmovietowatch.json") as movies_file:
    movies = json.load(movies_file)

    for movie in movies["data"]:
        meta = movie["meta"]
        imdb = meta.get("imdb")
        wikilink = meta.get("wikilink")

        if imdb and not imdb.startswith("http"):
            imdb = None
        if wikilink and not wikilink.startswith("http"):
            wikilink = None

        creation_date = datetime.fromtimestamp(movie["creationDate"] / 1000).date()

        db_movie = {
            "id": movie["id"],
            "slug": movie["slug"],
            "type": movie["type"],
            "title": movie["title"],
            "thumbnail": ensure_full_url(movie["thumbnail"]),
            "detailed_image": ensure_full_url(movie["detailedImage"]),
            "creation_date": creation_date.isoformat(),
            "staff_rating": movie["staffRating"],
            "short_summary": movie.get("shortSummary"),
            "is_very_best": movie["isVeryBest"],
            "is_premium": movie["isPremium"],
            "wikilink": wikilink,
            "imdb": imdb,
            "runtime": meta.get("runtime"),
        }

        cursor.execute(
            """
            insert or replace into movie (
                id,
                slug,
                type,
                title,
                thumbnail,
                detailed_image,
                creation_date,
                staff_rating,
                short_summary,
                is_very_best,
                is_premium,
                wikilink,
                imdb,
                runtime
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            tuple(db_movie.values()),
        )


conn.commit()
conn.close()
