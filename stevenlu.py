import sqlite3
from datetime import datetime
import json
import re


conn = sqlite3.connect("agoodmovietowatch.db")
cursor = conn.cursor()

cursor.execute(
    """
  select title, imdb
  from movie
  where imdb is not null
  order by creation_date desc
"""
)
movies = cursor.fetchall()

stevenlu_movies = []


for title, imdb_url in movies:
    imdb_id = imdb_url.split("/")[-2]

    title_without_year = re.match(r"^(.*?)\s*\(\d+\)$", title)

    if title_without_year:
        title_without_year = title_without_year.group(1)
    else:
        title_without_year = title

    stevenlu_movie = {
        "title": title_without_year,
        "imdb_id": imdb_id,
        "poster_url": None,
    }

    stevenlu_movies.append(stevenlu_movie)


with open("stevenlu.json", "w") as stevenlu:
    stevenlu_json = json.dumps(stevenlu_movies, indent=4)

    stevenlu.write(stevenlu_json)


with open("stevenlu-latest.json", "w") as stevenlu_latest:
    stevenlu_movies_latest = stevenlu_movies[:10]
    stevenlu_json = json.dumps(stevenlu_movies_latest, indent=4)

    stevenlu_latest.write(stevenlu_json)
