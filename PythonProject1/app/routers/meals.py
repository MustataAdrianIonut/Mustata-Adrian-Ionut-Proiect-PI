from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import MealCreate, MealRead, MealSummary
from app.crud.meals import create_meal_db, get_meals_by_user_db, get_meal_db
from app.nutrition import calculate_meal_nutrition
from app.models import Food

router = APIRouter(prefix="/meals", tags=["Meals"])

@router.post("/", response_model=MealRead)
def add_meal(data: MealCreate, db: Session = Depends(get_db)):
    return create_meal_db(db, data)

@router.get("/user/{user_id}", response_model=list[MealRead])
def list_user_meals(user_id: int, db: Session = Depends(get_db)):
    return get_meals_by_user_db(db, user_id)

@router.get("/{meal_id}/summary", response_model=MealSummary)
def get_meal_summary(meal_id: int, db: Session = Depends(get_db)):
    meal = get_meal_db(db, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")


    food = db.query(Food).get(meal.food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    kcal, protein, fat, carb = calculate_meal_nutrition(
        food.kcal_100g,
        food.protein_100g,
        food.fat_100g,
        food.carb_100g,
        meal.grams,
    )

    return MealSummary(
        meal_id=meal.id,
        user_id=meal.user_id,
        food_id=meal.food_id,
        grams=meal.grams,
        kcal=round(kcal, 2),
        protein_g=round(protein, 2),
        fat_g=round(fat, 2),
        carb_g=round(carb, 2),
    )