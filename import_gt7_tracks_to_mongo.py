import json
from pymongo import MongoClient, UpdateOne


INPUT_FILE = "gt7_tracks.json"

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "gt7_tuning"
COLLECTION_NAME = "tracks"


def main():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    with open(INPUT_FILE, "r", encoding="utf-8") as file:
        tracks = json.load(file)

    operations = []

    for track in tracks:
        course = track.get("course")
        layout = track.get("layout")

        if not course or not layout:
            continue

        operations.append(
            UpdateOne(
                {
                    "course": course,
                    "layout": layout
                },
                {
                    "$set": track,
                    "$setOnInsert": {
                        "createdFrom": "fandom_track_import"
                    }
                },
                upsert=True
            )
        )

    if operations:
        result = collection.bulk_write(operations)

        print("✅ Import circuits terminé")
        print(f"Insérés : {result.upserted_count}")
        print(f"Mis à jour : {result.modified_count}")
        print(f"Total traité : {len(operations)}")

    collection.create_index([("course", 1), ("layout", 1)], unique=True)
    collection.create_index("name")
    collection.create_index("country")
    collection.create_index("category")
    collection.create_index("trackType")

    print("✅ Index circuits créés")


if __name__ == "__main__":
    main()