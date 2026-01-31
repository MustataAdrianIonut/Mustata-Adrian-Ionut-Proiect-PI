# app/nutrition.py

def calculate_bmr(sex: str, weight: float, height: int, age: int) -> float:
    sex = sex.lower()
    if sex == "m":
        return 10 * weight + 6.25 * height - 5 * age + 5
    else:
        return 10 * weight + 6.25 * height - 5 * age - 161


def activity_multiplier(level: str) -> float:
    level = level.lower()
    mapping = {
        "deloc": 1.2,
        "usor": 1.375,
        "moderat": 1.55,
        "intens": 1.725
    }
    return mapping.get(level, 1.2)


def adjust_goal(tdee: float, goal: str) -> float:
    goal = goal.lower()
    if goal == "slabit":
        return tdee - 400
    elif goal == "masa":
        return tdee + 300
    return tdee


def calculate_meal_nutrition(
    kcal_100g: float,
    protein_100g: float,
    fat_100g: float,
    carb_100g: float,
    grams: float,
):
    factor = grams / 100.0

    kcal = kcal_100g * factor
    protein = protein_100g * factor
    fat = fat_100g * factor
    carb = carb_100g * factor

    return kcal, protein, fat, carb
