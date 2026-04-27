import requests
import json

API_URL = "https://gran-turismo.fandom.com/api.php"
PAGE_TITLE = "Gran Turismo 7/Track List"

params = {
    "action": "query",
    "prop": "revisions",
    "titles": PAGE_TITLE,
    "rvprop": "content",
    "rvslots": "main",
    "format": "json",
    "formatversion": "2",
}

response = requests.get(API_URL, params=params, timeout=30)
response.raise_for_status()

data = response.json()

print(json.dumps(data, indent=2)[:5000])