from typing import Literal, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=5000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    history: Optional[list[ChatMessage]] = None
    top_k: int = Field(default=5, ge=1, le=10)


class ChatSource(BaseModel):
    source: str
    page: Optional[int] = None
    source_url: Optional[str] = None
    relevance_score: float


class ChatResponse(BaseModel):
    answer: str
    generation_method: str
    sources: list[ChatSource]
