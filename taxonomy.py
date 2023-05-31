import sqlite3
import requests
from requests.exceptions import RequestException
import logging

logging.basicConfig(level=logging.DEBUG)

conn = sqlite3.connect("agoodmovietowatch.db")
cursor = conn.cursor()

cursor.executescript(
    """
    create table if not exists mood(
        id integer primary key,
        slug text,
        name text
    );
    create table if not exists genre(
        id integer primary key,
        slug text,
        name text
    );
    create table if not exists movie_mood(
        movie_id integer,
        mood_id integer
    );
    create table if not exists movie_genre(
        movie_id integer,
        genre_id integer
    );
    """
)


headers = {
    "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://agoodmovietowatch.com/",
    "purpose": "prefetch",
    "x-nextjs-data": "1",
    "DNT": "1",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "Save-Data": "on",
    "Sec-GPC": "1",
    "Pragma": "no-cache",
    "Cache-Control": "no-cache",
}

params = {
    "filters": "all",
}

session = requests.Session()

try:
    response = session.get(
        "https://agoodmovietowatch.com/_next/data/OzlFd225dxovkxNQ9QgxA/all.json",
        params=params,
        headers=headers,
    )
    response.raise_for_status()
    page_data = response.json()

    taxonomy = page_data["pageProps"]["sideMenuConfig"]["quickLinks"]["sections"]
    moods = taxonomy[3]["list"]
    genres = taxonomy[4]["list"]

    for mood in moods:
        cursor.execute(
            "insert or replace into mood(id, slug, name) values (?, ?, ?)",
            (mood["id"], mood["slug"], mood["name"]),
        )
        conn.commit()

    for genre in genres:
        cursor.execute(
            "insert or replace into genre(id, slug, name) values (?, ?, ?)",
            (genre["id"], genre["slug"], genre["name"]),
        )
        conn.commit()

except RequestException as e:
    logging.exception(
        "Unable to refresh mood and genre listing. Will use existing one in database"
    )

    cursor.execute("select id, slug from mood")
    moods = [{"id": mood[0], "slug": mood[1]} for mood in cursor.fetchall()]

    cursor.execute("select id, slug from genre")
    genres = [{"id": genre[0], "slug": genre[1]} for genre in cursor.fetchall()]


def download_movies(**filters):
    params = {"page": "1", "limit": "10000", "content_type": "movie", **filters}
    movies_response = session.get(
        "https://agoodmovietowatch.com/api/content", params=params, headers=headers
    )

    movies_response.raise_for_status()
    movies = movies_response.json()

    return movies["data"]


cursor.execute("delete from movie_mood")

for mood in moods:
    movies = download_movies(mood=mood["slug"])

    for movie in movies:
        cursor.execute(
            "insert or replace into movie_mood(movie_id, mood_id) values (?, ?)",
            (movie["id"], mood["id"]),
        )

    conn.commit()

cursor.execute("delete from movie_genre")

for genre in genres:
    movies = download_movies(genre=genre["slug"])

    for movie in movies:
        cursor.execute(
            "insert or replace into movie_genre(movie_id, genre_id) values (?, ?)",
            (movie["id"], genre["id"]),
        )

    conn.commit()


conn.close()
