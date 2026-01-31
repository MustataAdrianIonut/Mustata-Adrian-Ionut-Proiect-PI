from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Food
from app.schemas import FoodRecommendation
from app.ml.recommender import recommend_foods_knn

router = APIRouter(prefix="/ml", tags=["ML"])


@router.get("/recommendations", response_model=list[FoodRecommendation])
def ml_recommendations(
    target_kcal_100g: float = Query(..., gt=0),
    target_protein_100g: float = Query(..., ge=0),
    target_fat_100g: float = Query(..., ge=0),
    target_carb_100g: float = Query(..., ge=0),
    k: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
):
    foods = db.query(Food).all()
    if not foods:
        raise HTTPException(status_code=400, detail="No foods in database")

    target = (target_kcal_100g, target_protein_100g, target_fat_100g, target_carb_100g)
    recs = recommend_foods_knn(foods, target, k=k)
    return recs
