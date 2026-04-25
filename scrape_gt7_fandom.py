import json
import re
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


API_URL = "https://gran-turismo.fandom.com/api.php"
BASE_URL = "https://gran-turismo.fandom.com"
PAGE_TITLE = "Gran Turismo 7/Car List"


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def get_best_image_url(img):
    if not img:
        return None

    for attr in ["data-src", "src"]:
        value = img.get(attr)
        if value and not value.startswith("data:"):
            return value.split("/revision/")[0]

    srcset = img.get("srcset")
    if srcset:
        first = srcset.split(",")[0].strip().split(" ")[0]
        return first.split("/revision/")[0]

    return None


def fetch_page_html() -> str:
    params = {
        "action": "parse",
        "page": PAGE_TITLE,
        "prop": "text",
        "format": "json",
        "formatversion": "2",
        "redirects": "1",
    }

    headers = {
        "User-Agent": "GT7TuningApp/0.1 (personal project)",
        "Accept": "application/json",
    }

    response = requests.get(API_URL, params=params, headers=headers, timeout=30)
    response.raise_for_status()

    data = response.json()

    if "error" in data:
        raise RuntimeError(data["error"])

    return data["parse"]["text"]


def scrape_gt7_car_list():
    html = fetch_page_html()
    soup = BeautifulSoup(html, "lxml")

    cars = []
    current_manufacturer = None

    for element in soup.find_all(["h2", "table"]):
        if element.name == "h2":
            headline = clean_text(element.get_text())
            headline = headline.replace("[edit]", "").strip()

            if headline and headline.lower() not in ["contents", "navigation"]:
                current_manufacturer = headline

        elif element.name == "table" and current_manufacturer:
            rows = element.select("tr")

            for row in rows[1:]:
                cells = row.find_all(["td", "th"])
                if not cells:
                    continue

                link = cells[0].find("a", href=True)
                if not link:
                    continue

                name = clean_text(link.get_text())
                if not name:
                    continue

                car_url = urljoin(BASE_URL, link["href"])

                group = None
                if len(cells) > 1:
                    group = clean_text(cells[1].get_text()) or None

                img = row.find("img")
                image_url = get_best_image_url(img)
                image_alt = clean_text(img.get("alt")) if img else None

                cars.append({
                    "source": "fandom",
                    "game": "Gran Turismo 7",
                    "manufacturer": current_manufacturer,
                    "name": name,
                    "group": group,
                    "pageUrl": car_url,
                    "imageUrl": image_url,
                    "imageAlt": image_alt,
                })

    return cars


if __name__ == "__main__":
    cars = scrape_gt7_car_list()

    with open("gt7_cars_fandom.json", "w", encoding="utf-8") as f:
        json.dump(cars, f, ensure_ascii=False, indent=2)

    print(f"✅ {len(cars)} voitures exportées dans gt7_cars_fandom.json")

    for car in cars[:5]:
        print(car)