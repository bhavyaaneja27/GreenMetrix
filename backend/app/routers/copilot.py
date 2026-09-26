from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import ChatRequest, ChatResponse
from app.ai.langgraph_agent import copilot_agent

router = APIRouter(prefix="/api/assistant", tags=["AI Copilot"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_copilot(req: ChatRequest, db: Session = Depends(get_db)):
    res = copilot_agent.process_query(req.message, req.factory_id, db)
    return ChatResponse(
        answer=res["answer"],
        insights=res.get("insights", []),
        recommendations=res.get("recommendations", []),
        sources=res.get("sources", []),
        assumptions=res.get("assumptions", []),
        data_quality=res.get("data_quality", "Verified"),
        tool_calls=res.get("tool_calls", [])
    )
