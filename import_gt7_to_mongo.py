import json
from pymongo import MongoClient, UpdateOne


INPUT_FILE = "gt7_cars_enriched.json"

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "gt7_tuning"
COLLECTION_NAME = "cars"


def main():
    client = MongoClient(MONGO_URI)

    db = client[DB_NAME]
    cars_collection = db[COLLECTION_NAME]

    with open(INPUT_FILE, "r", encoding="utf-8") as file:
        cars = json.load(file)

    operations = []

    for car in cars:
        page_url = car.get("pageUrl")

        if not page_url:
            continue

        operations.append(
            UpdateOne(
                {"pageUrl": page_url},
                {
                    "$set": car,
                    "$setOnInsert": {
                        "createdFrom": "fandom_import"
                    }
                },
                upsert=True
            )
        )

    if operations:
        result = cars_collection.bulk_write(operations)

        print("Import terminé")
        print(f"Voitures insérées : {result.upserted_count}")
        print(f"Voitures mises à jour : {result.modified_count}")
        print(f"Total traité : {len(operations)}")
    else:
        print("Aucune voiture à importer")

    cars_collection.create_index("pageUrl", unique=True)
    cars_collection.create_index("manufacturer")
    cars_collection.create_index("name")
    cars_collection.create_index("group")

    print("Index créés")


if __name__ == "__main__":
    main()