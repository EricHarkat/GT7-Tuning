import re
from pymongo import MongoClient


MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "gt7_tuning"
COLLECTION_NAME = "cars"

def determine_engine_type(car):
    specs = car.get("specs", {})

    aspiration = str(specs.get("aspiration") or "").lower()
    engine_type = str(specs.get("engine_type") or "").lower()
    raw_text = f"{aspiration} {engine_type} {car.get('name') or ''}".lower()

    if "electric" in raw_text:
        return "Electric"

    if "hybrid" in raw_text:
        return "Hybrid"

    if "turbo" in raw_text:
        return "Turbo"

    if "supercharged" in raw_text or "supercharger" in raw_text:
        return "Supercharged"

    if "naturally-aspirated" in raw_text or "naturally aspirated" in raw_text:
        return "NA"

    return None

def determine_category(car):
    group = (car.get("group") or "").lower()
    name = (car.get("name") or "").lower()

    # Race cars
    if any(g in group for g in ["gr.1", "gr.2", "gr.3", "gr.4", "gr.b"]):
        return "race"

    # Concept cars
    if any(word in name for word in ["vision", "concept", "prototype"]):
        return "concept"

    return "road"

def clean_manufacturer(value):
    if not value:
        return None

    # supprime tout ce qui est entre crochets
    cleaned = re.sub(r"\[.*?\]", "", value)

    return cleaned.strip()

def extract_year_from_car_name(value):
    if not value:
        return None

    text = str(value)

    # Cas GT7 : Abarth 500 '09 / FIAT Abarth 595 Esseesse '70
    short_year_match = re.search(r"'(\d{2})\b", text)
    if short_year_match:
        short_year = int(short_year_match.group(1))

        # Règle simple :
        # '00 à '29 => 2000-2029
        # '30 à '99 => 1930-1999
        return 2000 + short_year if short_year <= 29 else 1900 + short_year

    # Cas : AFEELA Prototype 2024
    full_year_match = re.search(r"\b(19\d{2}|20\d{2})\b", text)
    if full_year_match:
        return int(full_year_match.group(1))

    return None


def extract_year_from_text(value):
    if not value:
        return None

    match = re.search(r"\b(19\d{2}|20\d{2})\b", str(value))

    if not match:
        return None

    return int(match.group(1))


def extract_number(value):
    if not value:
        return None

    text = str(value).replace(",", "")
    match = re.search(r"(\d+(?:\.\d+)?)", text)

    if not match:
        return None

    number = float(match.group(1))

    if number.is_integer():
        return int(number)

    return number


def normalize_drivetrain(value):
    if not value:
        return None

    drivetrain = str(value).upper().strip()

    mapping = {
        "FF": "FWD",
        "FR": "RWD",
        "MR": "RWD",
        "RR": "RWD",
        "4WD": "AWD",
        "AWD": "AWD",
        "FWD": "FWD",
        "RWD": "RWD",
        "ALL-WHEEL DRIVE": "AWD",
        "FRONT-WHEEL DRIVE": "FWD",
        "REAR-WHEEL DRIVE": "RWD",
    }

    return mapping.get(drivetrain, drivetrain)


def pick_spec(specs, *keys):
    if not specs:
        return None

    for key in keys:
        if key in specs:
            return specs[key]

    return None


def build_normalized(car):
    specs = car.get("specs", {})

    power_raw = pick_spec(
        specs,
        "power",
        "Power",
        "max_power",
        "maximum_power"
    )

    weight_raw = pick_spec(
        specs,
        "weight",
        "Weight"
    )

    torque_raw = pick_spec(
        specs,
        "torque",
        "Torque"
    )

    drivetrain_raw = pick_spec(
        specs,
        "drivetrain",
        "Drivetrain"
    )

    pp_raw = pick_spec(
        specs,
        "pp",
        "PP",
        "performance_points",
        "performancePoints",
        "pp_in_gt7",
        "PP in GT7"
    )

    year_raw = pick_spec(
        specs,
        "year",
        "Year"
    )

    power_hp = extract_number(power_raw)
    weight_kg = extract_number(weight_raw)
    torque = extract_number(torque_raw)
    pp = extract_number(pp_raw)
    year = (
        extract_number(year_raw)
        or extract_year_from_car_name(car.get("name"))
        or extract_year_from_car_name(car.get("pageTitle"))
    )
    drivetrain = normalize_drivetrain(drivetrain_raw)

    power_to_weight = None
    weight_to_power = None

    if power_hp and weight_kg:
        power_to_weight = round(power_hp / weight_kg, 4)
        weight_to_power = round(weight_kg / power_hp, 2)

    return {
        "powerHp": power_hp,
        "weightKg": weight_kg,
        "torque": torque,
        "pp": pp,
        "year": year,
        "drivetrain": drivetrain,
        "raw": {
            "power": power_raw,
            "weight": weight_raw,
            "torque": torque_raw,
            "drivetrain": drivetrain_raw,
            "pp": pp_raw,
            "year": year_raw,
        },
        "metrics": {
            "powerToWeight": power_to_weight,
            "weightToPower": weight_to_power,
        }
    }


def main():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    cars = collection.find({})
    updated_count = 0

    for car in cars:
        normalized = build_normalized(car)
        manufacturer_clean = clean_manufacturer(car.get("manufacturer"))
        category = determine_category(car)
        engine_type = determine_engine_type(car)

        collection.update_one(
            {"_id": car["_id"]},
            {
                "$set": {
                    "normalized": normalized,
                    "manufacturer": manufacturer_clean,
                    "category": category,
                    "engineType": engine_type
                }
            }
        )

        updated_count += 1

    print(f"✅ Normalisation terminée")
    print(f"✅ Voitures mises à jour : {updated_count}")


if __name__ == "__main__":
    main()