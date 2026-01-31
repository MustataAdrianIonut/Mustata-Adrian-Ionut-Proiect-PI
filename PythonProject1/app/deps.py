from fastapi import Header, HTTPException
from app.config import ADMIN_PASSWORD

def require_admin(x_admin_password: str = Header(default="")):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
