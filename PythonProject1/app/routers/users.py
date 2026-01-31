import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import (
    UserCreate,
    UserRead,
    UserCalories,
    DailyMeal,
    UserDailySummary,
    MealPlan,
    MealPlanItem,
)
from app.crud.users import create_user_db, get_user_db, get_users_db
from app.crud.meals import get_meals_by_user_db
from app.models import Food
from app.nutrition import (
    calculate_bmr,
    activity_multiplier,
    adjust_goal,
    calculate_meal_nutrition,
)

router = APIRouter(prefix="/users", tags=["Users"])



def grams_for_target(food: Food, target_kcal: float) -> float:

    return (target_kcal / food.kcal_100g) * 100.0


def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def pick_food_for_meal(pool: list[Food], target_kcal: float) -> tuple[Food, float]:

    feasible: list[tuple[Food, float]] = []
    for f in pool:
        if not f.kcal_100g or f.kcal_100g <= 0:
            continue
        g = grams_for_target(f, target_kcal)
        if 100 <= g <= 200:
            feasible.append((f, g))

    if feasible:
        return random.choice(feasible)

    f = random.choice(pool)
    g = grams_for_target(f, target_kcal) if f.kcal_100g and f.kcal_100g > 0 else 100
    g = clamp(g, 100, 200)
    return f, g


#Users CRUD

@router.post("/", response_model=UserRead)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user_db(db, user)


@router.get("/", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    # Poți să-l păstrezi, chiar dacă admin are endpoint separat.
    return get_users_db(db)


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_db(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Calories

@router.get("/{user_id}/calories", response_model=UserCalories)
def get_user_calories(user_id: int, db: Session = Depends(get_db)):
    user = get_user_db(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    bmr = calculate_bmr(user.sex, user.weight_kg, user.height_cm, user.age)
    tdee = bmr * activity_multiplier(user.activity)
    recommended = adjust_goal(tdee, user.goal)

    return UserCalories(
        bmr=round(bmr),
        tdee=round(tdee),
        recommended_calories=round(recommended),
    )


# Daily summary
@router.get("/{user_id}/summary", response_model=UserDailySummary)
def get_user_daily_summary(user_id: int, db: Session = Depends(get_db)):
    user = get_user_db(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    bmr = calculate_bmr(user.sex, user.weight_kg, user.height_cm, user.age)
    tdee = bmr * activity_multiplier(user.activity)
    recommended = adjust_goal(tdee, user.goal)

    meals = get_meals_by_user_db(db, user_id)

    daily_meals: list[DailyMeal] = []
    total_kcal = 0.0

    for meal in meals:
        food = db.query(Food).get(meal.food_id)
        if not food:
            continue

        kcal, protein, fat, carb = calculate_meal_nutrition(
            food.kcal_100g,
            food.protein_100g,
            food.fat_100g,
            food.carb_100g,
            meal.grams,
        )

        total_kcal += kcal

        daily_meals.append(
            DailyMeal(
                meal_id=meal.id,
                food_name=food.name,
                grams=meal.grams,
                kcal=round(kcal, 2),
                protein_g=round(protein, 2),
                fat_g=round(fat, 2),
                carb_g=round(carb, 2),
            )
        )

    return UserDailySummary(
        user_id=user.id,
        bmr=round(bmr),
        tdee=round(tdee),
        recommended_calories=round(recommended),
        total_meal_calories=round(total_kcal, 2),
        meals=daily_meals,
    )



# Meal plan

@router.get("/{user_id}/plan", response_model=MealPlan)
def generate_meal_plan(user_id: int, db: Session = Depends(get_db)):
    user = get_user_db(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    bmr = calculate_bmr(user.sex, user.weight_kg, user.height_cm, user.age)
    tdee = bmr * activity_multiplier(user.activity)
    recommended = adjust_goal(tdee, user.goal)

    #targeturi pe mese
    targets = [
        ("Mic dejun", "breakfast", recommended * 0.30),
        ("Pranz", "lunch", recommended * 0.40),
        ("Cina", "dinner", recommended * 0.30),
    ]

    meals: list[MealPlanItem] = []

    for meal_name, meal_type, target_kcal in targets:
        pool = db.query(Food).filter(Food.meal_type == meal_type).all()

        if not pool:
            raise HTTPException(
                status_code=400,
                detail=f"No foods available for '{meal_type}'. Add foods with meal_type='{meal_type}' as admin.",
            )

        food, grams = pick_food_for_meal(pool, target_kcal)

        kcal, protein, fat, carb = calculate_meal_nutrition(
            food.kcal_100g,
            food.protein_100g,
            food.fat_100g,
            food.carb_100g,
            grams,
        )

        meals.append(
            MealPlanItem(
                meal_name=meal_name,
                food_id=food.id,
                food_name=food.name,
                grams=round(grams, 1),
                kcal=round(kcal, 1),
                protein_g=round(protein, 1),
                fat_g=round(fat, 1),
                carb_g=round(carb, 1),
            )
        )

    return MealPlan(
        user_id=user.id,
        recommended_calories=round(recommended, 1),
        meals=meals,
    )
