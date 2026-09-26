"""
GreenMetriX AI Copilot Router
------------------------------
Exposes two endpoints:
  POST /api/assistant/chat   — original path (kept for backward-compat)
  POST /api/copilot          — new canonical path from the integration spec

Both endpoints delegate to the GeminiCopilot singleton, which:
  - Always applies the GreenMetriX system prompt (enforced server-side)
  - Injects live factory context when factory_id is provided
  - Keeps the GEMINI_API_KEY exclusively on the backend
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import ChatRequest, ChatResponse
from app.ai.gemini_copilot import gemini_copilot

logger = logging.getLogger("greenmetrix.copilot_router")

# We declare both prefixes using two separate routers
# so that main.py can include both without changing any existing code.
router = APIRouter(prefix="/api/assistant", tags=["AI Copilot"])
copilot_router = APIRouter(prefix="/api/copilot", tags=["AI Copilot"])


def _process(req: ChatRequest, db: Session) -> ChatResponse:
    """Shared handler used by both route prefixes."""
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    result = gemini_copilot.ask(
        message=req.message.strip(),
        factory_id=req.factory_id,
        db=db,
    )
    return ChatResponse(
        answer=result["answer"],
        insights=result.get("insights", []),
        recommendations=result.get("recommendations", []),
        sources=result.get("sources", []),
        assumptions=result.get("assumptions", []),
        data_quality=result.get("data_quality", "AI-Generated"),
        tool_calls=result.get("tool_calls", []),
    )


# ── Original endpoint (backward compatible) ──
@router.post("/chat", response_model=ChatResponse)
def chat_with_copilot(req: ChatRequest, db: Session = Depends(get_db)):
    return _process(req, db)


# ── New canonical endpoint ──
@copilot_router.post("", response_model=ChatResponse)
def copilot_query(req: ChatRequest, db: Session = Depends(get_db)):
    return _process(req, db)
