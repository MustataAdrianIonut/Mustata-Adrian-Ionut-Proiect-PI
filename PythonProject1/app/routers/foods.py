from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import FoodCreate, FoodRead
from app.crud.foods import create_food_db, get_foods_db

router = APIRouter(prefix="/foods", tags=["Foods"])


@router.get("/", response_model=list[FoodRead])
def list_foods(db: Session = Depends(get_db)):
    return get_foods_db(db)
