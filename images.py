import sqlite3
from datetime import datetime
import requests
from requests.exceptions import RequestException
import logging

logging.basicConfig(level=logging.DEBUG)


conn = sqlite3.connect("agoodmovietowatch.db")
cursor = conn.cursor()

cursor.executescript(
    """
    create table if not exists image(
        url text primary key,
        updated_date text,
        image_blob blob
    );
    """
)

cursor.execute(
    """
    select
        thumbnail
    from movie
    left join image on thumbnail = url
    where url is null

    union

    select
        detailed_image
    from movie
    left join image on detailed_image = url
    where url is null
"""
)
images_not_downloaded = cursor.fetchall()

logging.info("Missing %d images", len(images_not_downloaded))

session = requests.Session()


for (image_url,) in images_not_downloaded:
    response = session.get(image_url)

    try:
        response.raise_for_status()

        image_blob = response.content
        download_date = datetime.now()

        cursor.execute(
            "insert or replace into image (url, updated_date, image_blob) values (?, ?, ?)",
            (image_url, download_date.isoformat(), image_blob),
        )
        conn.commit()
    except RequestException as e:
        logging.exception(e)


conn.close()
