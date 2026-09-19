import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Factory
from app.schemas.schemas import ActionPlanResponse
from app.ai.tools import generate_action_plan_tool

router = APIRouter(prefix="/api/action-plan", tags=["Action Planner"])

@router.post("", response_model=ActionPlanResponse)
def get_action_plan(data: dict, db: Session = Depends(get_db)):
    factory_id = data.get("factory_id", 1)
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")

    actions = generate_action_plan_tool(db, factory.id)
    return ActionPlanResponse(
        factory_id=factory.id,
        factory_name=factory.name,
        generated_at=datetime.datetime.utcnow(),
        actions=actions,
        disclaimer="Potential scenario-based recommendations. Validate with on-site certified energy audit."
    )
