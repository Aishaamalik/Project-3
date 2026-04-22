from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.image import router as image_router
from app.routes.auth import router as auth_router
from app.routes.billing import router as billing_router
from app.db import init_db

app = FastAPI(title="Project 3 API")
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(image_router)
app.include_router(auth_router)
app.include_router(billing_router)
