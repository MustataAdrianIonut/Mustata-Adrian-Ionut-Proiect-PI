from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserCreate


def create_user_db(db: Session, user: UserCreate):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users_db(db: Session):
    return db.query(User).all()

def get_user_db(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_name_db(db: Session, name: str):
    return db.query(User).filter(User.name == name).first()

