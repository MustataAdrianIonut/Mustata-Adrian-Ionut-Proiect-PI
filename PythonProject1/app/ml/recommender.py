from __future__ import annotations

from typing import List, Dict, Tuple
import numpy as np
from sklearn.neighbors import NearestNeighbors

from app.models import Food


def _features_for_food(food: Food) -> np.ndarray:

    return np.array(
        [food.kcal_100g, food.protein_100g, food.fat_100g, food.carb_100g],
        dtype=float,
    )


def recommend_foods_knn(
    foods: List[Food],
    target: Tuple[float, float, float, float],
    k: int = 5,
) -> List[Dict]:

    if not foods:
        return []

    X = np.vstack([_features_for_food(f) for f in foods])
    y = np.array(target, dtype=float).reshape(1, -1)

    k = max(1, min(k, len(foods)))

    model = NearestNeighbors(n_neighbors=k, metric="euclidean")
    model.fit(X)

    distances, indices = model.kneighbors(y)

    results: List[Dict] = []
    for dist, idx in zip(distances[0], indices[0]):
        f = foods[int(idx)]
        results.append(
            {
                "id": f.id,
                "name": f.name,
                "kcal_100g": f.kcal_100g,
                "protein_100g": f.protein_100g,
                "fat_100g": f.fat_100g,
                "carb_100g": f.carb_100g,
                "distance": float(dist),
            }
        )
    return results
