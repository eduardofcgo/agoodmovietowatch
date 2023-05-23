import os
import shutil

try:
    os.makedirs("publish")
except FileExistsError:
    pass

shutil.copy("agoodmovietowatch.db", "publish/agoodmovietowatch.sqlite")

shutil.copy("stevenlu.json", "publish/stevenlu.json")
shutil.copy("stevenlu-latest.json", "publish/stevenlu-latest.json")
