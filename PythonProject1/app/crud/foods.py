from sqlalchemy.orm import Session
from app.models import Food
from app.schemas import FoodCreate


def create_food_db(db: Session, food: FoodCreate):
    db_food = Food(**food.dict())
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food


def get_foods_db(db: Session):
    return db.query(Food).all()
