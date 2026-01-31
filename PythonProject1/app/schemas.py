from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    sex: str
    age: int
    weight_kg: float
    height_cm: int
    activity: str
    goal: str

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: int
    class Config:
        from_attributes = True


class FoodBase(BaseModel):
    name: str
    kcal_100g: float
    protein_100g: float
    fat_100g: float
    carb_100g: float
    meal_type: str  # "breakfast" | "lunch" | "dinner"

class FoodCreate(FoodBase):
    pass

class FoodRead(FoodBase):
    id: int
    class Config:
        from_attributes = True

class UserCalories(BaseModel):
    bmr: int
    tdee: int
    recommended_calories: int

class MealCreate(BaseModel):
    user_id: int
    food_id: int
    grams: float


class MealRead(BaseModel):
    id: int
    user_id: int
    food_id: int
    grams: float

    class Config:
        from_attributes = True

class MealSummary(BaseModel):
    meal_id: int
    user_id: int
    food_id: int
    grams: float
    kcal: float
    protein_g: float
    fat_g: float
    carb_g: float


class DailyMeal(BaseModel):
    meal_id: int
    food_name: str
    grams: float
    kcal: float
    protein_g: float
    fat_g: float
    carb_g: float

class UserDailySummary(BaseModel):
    user_id: int
    bmr: float
    tdee: float
    recommended_calories: float
    total_meal_calories: float
    meals: list[DailyMeal]

class MealPlanItem(BaseModel):
    meal_name: str
    food_id: int
    food_name: str
    grams: float
    kcal: float
    protein_g: float
    fat_g: float
    carb_g: float


class MealPlan(BaseModel):
    user_id: int
    recommended_calories: float
    meals: list[MealPlanItem]

class FoodRecommendation(BaseModel):
    id: int
    name: str
    kcal_100g: float
    protein_100g: float
    fat_100g: float
    carb_100g: float
    distance: float
