import json
import re
import time
from urllib.parse import urlparse, unquote

import requests
from bs4 import BeautifulSoup


INPUT_FILE = "gt7_cars_fandom.json"
OUTPUT_FILE = "gt7_cars_enriched.json"

API_URL = "https://gran-turismo.fandom.com/api.php"
SLEEP_SECONDS = 1


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def page_title_from_url(url: str) -> str:
    path = urlparse(url).path
    title = path.replace("/wiki/", "")
    return unquote(title).replace("_", " ")


def fetch_page_html(page_title: str) -> str:
    params = {
        "action": "parse",
        "page": page_title,
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


def extract_infobox_data(html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")

    data = {}

    # Fandom utilise souvent portable-infobox
    infobox = soup.select_one("aside.portable-infobox")

    if infobox:
        items = infobox.select(".pi-item.pi-data")

        for item in items:
            label = item.select_one(".pi-data-label")
            value = item.select_one(".pi-data-value")

            if not label or not value:
                continue

            key = clean_text(label.get_text())
            val = clean_text(value.get_text(" "))

            if key and val:
                data[key] = val

    return data


def normalize_specs(raw_specs: dict) -> dict:
    """
    Convertit les labels Fandom en clés plus faciles à utiliser.
    Les noms exacts peuvent varier selon les pages.
    """
    normalized = {}

    mapping = {
        "Engine": "engine",
        "Aspiration": "aspiration",
        "Power": "power",
        "Torque": "torque",
        "Drivetrain": "drivetrain",
        "Weight": "weight",
        "Length": "length",
        "Width": "width",
        "Height": "height",
        "Price": "price",
        "Cr.": "price",
        "PP": "pp",
        "Performance Points": "pp",
        "Year": "year",
        "Country": "country",
    }

    for key, value in raw_specs.items():
        normalized_key = mapping.get(key, key.lower().replace(" ", "_"))
        normalized[normalized_key] = value

    return normalized


def enrich_car(car: dict) -> dict:
    page_title = page_title_from_url(car["pageUrl"])
    html = fetch_page_html(page_title)

    raw_specs = extract_infobox_data(html)
    specs = normalize_specs(raw_specs)

    enriched = {
        **car,
        "pageTitle": page_title,
        "specs": specs,
        "rawSpecs": raw_specs,
    }

    return enriched


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        cars = json.load(f)

    enriched_cars = []

    for index, car in enumerate(cars, start=1):
        try:
            print(f"[{index}/{len(cars)}] Enrichissement : {car['name']}")

            enriched = enrich_car(car)
            enriched_cars.append(enriched)

            time.sleep(SLEEP_SECONDS)

        except Exception as error:
            print(f"⚠️ Erreur sur {car.get('name')}: {error}")

            enriched_cars.append({
                **car,
                "error": str(error),
                "specs": {},
                "rawSpecs": {},
            })

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(enriched_cars, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Export terminé : {OUTPUT_FILE}")
    print(f"✅ {len(enriched_cars)} voitures traitées")


if __name__ == "__main__":
    main()