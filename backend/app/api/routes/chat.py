from fastapi import APIRouter, HTTPException

from backend.app.ai.chatbot import answer_question
from backend.app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["RAG Chatbot"])


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        history = [message.model_dump() for message in (request.history or [])]
        return answer_question(
            question=request.message,
            top_k=request.top_k,
            history=history,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {exc}") from exc
