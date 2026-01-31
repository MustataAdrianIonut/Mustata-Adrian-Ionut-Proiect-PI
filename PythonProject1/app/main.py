from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .db import Base, engine

from .routers.auth import router as auth_router
from .routers.admin import router as admin_router


from .routers.ml import router as ml_router
from .routers.users import router as users_router
from .routers.foods import router as foods_router
from .routers.meals import router as meals_router

app = FastAPI(title="Nutri API")


Base.metadata.create_all(bind=engine)


app.mount("/static", StaticFiles(directory="app/static"), name="static")


templates = Jinja2Templates(directory="app/templates")

# UI
@app.get("/")
def ui(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API routers
app.include_router(users_router)
app.include_router(foods_router)
app.include_router(meals_router)
app.include_router(ml_router)
app.include_router(auth_router)
app.include_router(admin_router)