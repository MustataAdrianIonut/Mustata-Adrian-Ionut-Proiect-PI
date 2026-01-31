from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import UserRead
from app.crud.users import get_user_by_name_db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/user", response_model=UserRead)
def login_user_by_name(name: str, db: Session = Depends(get_db)):
    name = (name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    user = get_user_by_name_db(db, name)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
