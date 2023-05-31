import requests
import json


headers = {
    "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "DNT": "1",
    "Alt-Used": "agoodmovietowatch.com",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Save-Data": "on",
    "Sec-GPC": "1",
}

params = {"page": "1", "limit": "10000", "content_type": "movie"}

movies_response = requests.get(
    "https://agoodmovietowatch.com/api/content", params=params, headers=headers
)

movies_response.raise_for_status()
movies = movies_response.json()
movies_json = json.dumps(movies, indent=4)

with open("agoodmovietowatch.json", "w") as movies_file:
    movies_file.write(movies_json)
