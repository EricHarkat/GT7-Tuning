import json
import re
import requests


API_URL = "https://gran-turismo.fandom.com/api.php"
PAGE_TITLE = "Gran Turismo 7/Track List"
OUTPUT_FILE = "gt7_tracks.json"


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def parse_params(text: str) -> dict:
    params = {}

    parts = text.split("|")

    for part in parts[1:]:
        if "=" not in part:
            continue

        key, value = part.split("=", 1)
        params[key.strip()] = clean_text(value.strip())

    return params


def yes_no_to_bool(value: str):
    value = (value or "").lower()

    if value in ["yes", "y"]:
        return True

    if value in ["no", "n"]:
        return False

    return None


def classify_track(track):
    track_type = (track.get("trackType") or "").lower()
    name = (track.get("name") or "").lower()
    length = track.get("lengthMeters") or 0

    if track_type == "dirt" or any(word in name for word in ["ranch", "windmills", "lake louise", "snow"]):
        return "rally"

    if length >= 7000:
        return "high_speed"

    if length <= 3000:
        return "technical"

    return "balanced"


def fetch_wikitext() -> str:
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
    return data["query"]["pages"][0]["revisions"][0]["slots"]["main"]["content"]


def extract_course_blocks(wikitext: str):
    pattern = re.compile(
        r"\{\{CourseWithLayouts\|(?P<body>.*?)(?=\n\}\})\n\}\}",
        re.DOTALL
    )

    return pattern.finditer(wikitext)


def scrape_tracks():
    wikitext = fetch_wikitext()

    tracks = []

    for course_match in extract_course_blocks(wikitext):
        body = course_match.group("body")

        # Séparer infos course et layouts
        if "|layouts=" not in body:
            continue

        course_part, layouts_part = body.split("|layouts=", 1)

        course_params = parse_params("CourseWithLayouts|" + course_part)

        course_name = course_params.get("name")
        country = course_params.get("country")
        course_link = course_params.get("link")

        if not course_name:
            continue

        layout_pattern = re.compile(r"\{\{CourseLayout\|(?P<body>.*?)\}\}", re.DOTALL)

        for layout_match in layout_pattern.finditer(layouts_part):
            layout_body = layout_match.group("body")
            layout_params = parse_params("CourseLayout|" + layout_body)

            layout_name = layout_params.get("name")
            layout_link = layout_params.get("link")
            track_type = layout_params.get("type")
            length_raw = layout_params.get("length")
            reversible_raw = layout_params.get("reversible")
            rain_raw = layout_params.get("rain")
            sophy_raw = layout_params.get("sophy")
            image = layout_params.get("image")

            if not layout_name:
                continue

            length_meters = None
            if length_raw:
                length_meters = int(length_raw.replace(",", ""))

            name = course_name if layout_name.lower() == "full course" else f"{course_name} - {layout_name}"

            track = {
                "source": "fandom",
                "game": "Gran Turismo 7",
                "course": course_name,
                "layout": layout_name,
                "name": name,
                "country": country,
                "courseLink": course_link,
                "layoutLink": layout_link,
                "trackType": track_type,
                "lengthRaw": length_raw,
                "lengthMeters": length_meters,
                "reversible": yes_no_to_bool(reversible_raw),
                "rain": yes_no_to_bool(rain_raw),
                "gtSophy": sophy_raw,
                "image": image,
                "sourceUrl": "https://gran-turismo.fandom.com/wiki/Gran_Turismo_7/Track_List",
            }

            track["category"] = classify_track(track)

            tracks.append(track)

    return tracks


if __name__ == "__main__":
    tracks = scrape_tracks()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(tracks, file, ensure_ascii=False, indent=2)

    print(f"✅ {len(tracks)} circuits/tracés exportés dans {OUTPUT_FILE}")

    for track in tracks[:10]:
        print(track)