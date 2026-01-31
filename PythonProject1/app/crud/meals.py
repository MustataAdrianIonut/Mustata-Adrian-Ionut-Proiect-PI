from sqlalchemy.orm import Session
from app.models import Meal
from app.schemas import MealCreate

def create_meal_db(db: Session, data: MealCreate):
    meal = Meal(**data.dict())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal

def get_meals_by_user_db(db: Session, user_id: int):
    return db.query(Meal).filter(Meal.user_id == user_id).all()

def get_meal_db(db: Session, meal_id: int):
    return db.query(Meal).filter(Meal.id == meal_id).first()