from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import UserRead, FoodCreate, FoodRead
from app.models import User, Food

router = APIRouter(prefix="/admin", tags=["Admin"])


ADMIN_PASSWORD = "admin123"


def require_admin(x_admin_password: str | None = Header(default=None, alias="X-Admin-Password")):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return True


@router.get("/users", response_model=list[UserRead])
def admin_list_users(
    _: bool = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(User).all()


@router.get("/foods", response_model=list[FoodRead])
def admin_list_foods(
    _: bool = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(Food).all()


@router.post("/foods", response_model=FoodRead)
def admin_add_food(
    food: FoodCreate,
    _: bool = Depends(require_admin),
    db: Session = Depends(get_db),
):
    db_food = Food(**food.dict())
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food
