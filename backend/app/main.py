from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes.eligibility import router as eligibility_router
from backend.app.api.routes.schemes import router as schemes_router
from backend.app.api.routes.partners import router as partners_router
from backend.app.api.routes.calculator import router as calculator_router
from backend.app.api.routes.recommendations import router as recommendations_router
from backend.app.api.routes.chat import router as chat_router

app = FastAPI(
    title="Scheme Setu API",
    description="AI-driven scheme matching platform for marginalized entrepreneurs.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(eligibility_router)
app.include_router(schemes_router)
app.include_router(partners_router)
app.include_router(calculator_router)
app.include_router(recommendations_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return {"message": "Scheme Setu API is running."}
