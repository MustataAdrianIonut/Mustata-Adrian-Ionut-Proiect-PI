from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sex = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False)
    height_cm = Column(Integer, nullable=False)
    activity = Column(String, nullable=False)
    goal = Column(String, nullable=False)

class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    kcal_100g = Column(Float, nullable=False)
    protein_100g = Column(Float, nullable=False)
    fat_100g = Column(Float, nullable=False)
    carb_100g = Column(Float, nullable=False)
    meal_type = Column(String, nullable=False, default="lunch")
class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)
    grams = Column(Float, nullable=False)

    user = relationship("User")
    food = relationship("Food")