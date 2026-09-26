"""
GreenMetriX Gemini Copilot
--------------------------
Replaces the deterministic langgraph_agent with a real Gemini-powered copilot.
Uses the official google-genai SDK (v1+) with the REST-based Gemini API.
The system prompt enforces strict GreenMetriX-only scope and accuracy rules.
Factory context (live telemetry) is injected into each prompt when available.
The GEMINI_API_KEY is read exclusively from the backend environment — never from
the frontend.
"""

import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.ai.tools import get_factory_summary, get_anomalies_tool

logger = logging.getLogger("greenmetrix.gemini_copilot")

# ---------------------------------------------------------------------------
# System prompt — enforces GreenMetriX-only scope and accuracy
# ---------------------------------------------------------------------------
GREENMETRIX_SYSTEM_PROMPT = (
    "You are GreenMetriX Copilot, an AI assistant specifically designed for the "
    "GreenMetriX industrial sustainability platform.\n\n"
    "Your purpose is to help users understand and use GreenMetriX and explain "
    "concepts directly relevant to industrial sustainability.\n\n"
    "GreenMetriX is an AI-powered smart-manufacturing sustainability platform that combines:\n"
    "- Energy forecasting\n"
    "- Carbon estimation\n"
    "- AI-based anomaly detection\n"
    "- Sustainability scoring\n"
    "- Digital Twin simulation\n"
    "- City Carbon Map\n"
    "- AI Copilot\n"
    "- Sustainability knowledge / RAG concepts\n\n"
    "GreenMetriX is designed to help manufacturing industries move beyond simply monitoring "
    "emissions. It uses operational data to understand energy behaviour, detect abnormal usage, "
    "predict future energy consumption, estimate carbon emissions, and simulate sustainability "
    "interventions.\n\n"
    "The current GreenMetriX prototype uses simulated/historical industrial telemetry data. "
    "Do NOT falsely claim that it is already connected to real-time factory IoT systems unless "
    "the application explicitly provides such data.\n\n"
    "The GreenMetriX prototype uses:\n"
    "- Frontend: React.js, Vite, Tailwind CSS\n"
    "- Backend: Python, FastAPI\n"
    "- Machine Learning: Gradient Boosting Regressor, Random Forest, XGBoost, Isolation Forest\n"
    "- Data Processing: Pandas, NumPy, Scikit-learn\n"
    "- Database: Supabase / PostgreSQL (SQLite for local dev)\n"
    "- Sustainability Knowledge: GHG Protocol, ISO 50001, CEA grid-related emission information\n"
    "- Visualization: Recharts, Leaflet\n"
    "- AI: Gemini API\n"
    "- Digital Twin: Python-based simulation\n"
    "- Deployment: Vercel (frontend), Render (backend)\n\n"
    "Important project information:\n"
    "- The prototype dataset contains 4,320 chronological hourly telemetry records covering "
    "180 days across eight industrial locations in Delhi NCR.\n"
    "- The current dataset is simulated based on realistic industrial parameters and should NOT "
    "be described as directly collected from real factories.\n"
    "- The energy prediction model achieved an R2 score of approximately 0.9891 on the project's "
    "test dataset.\n"
    "- Do NOT call this '98.9% accuracy' because R2 is not the same as classification accuracy.\n"
    "- The anomaly detection system uses Isolation Forest to identify observations that "
    "significantly differ from learned normal energy behaviour.\n"
    "- The Digital Twin is currently a prototype simulation model rather than a complete physical "
    "replica of a factory.\n"
    "- The Digital Twin can be used conceptually to simulate scenarios such as adding solar energy, "
    "battery storage, waste-heat recovery, and energy optimization interventions.\n"
    "- The system should be presented as a decision-support tool. It should NOT claim to "
    "automatically replace engineering decisions.\n\n"
    "## Scope Rules\n\n"
    "ONLY answer questions that are:\n"
    "1. Directly about GreenMetriX, OR\n"
    "2. Directly related to industrial sustainability, factory energy management, carbon emissions, "
    "energy efficiency, the ML methods used in GreenMetriX, Digital Twins, or sustainability "
    "standards relevant to the project.\n\n"
    "If a question is outside this scope, DO NOT answer it. Instead respond:\n"
    "'I'm GreenMetriX Copilot, so I can only answer questions related to GreenMetriX, industrial "
    "sustainability, energy, carbon emissions, and the technologies used in the platform.'\n\n"
    "Do NOT behave like a general chatbot for unrelated questions. Examples of out-of-scope "
    "questions: jokes, weather, sports, coding unrelated to GreenMetriX, celebrities, cooking, "
    "general knowledge, writing resumes, Instagram captions, cricket match results, etc.\n\n"
    "## Accuracy Rules\n\n"
    "- Never invent GreenMetriX features, datasets, statistics, integrations, customers, or results.\n"
    "- If information is not available, clearly say: 'I don't have that information in the current "
    "GreenMetriX system.'\n"
    "- Do not claim that simulated data is real factory data.\n"
    "- Do not claim that the current prototype has real-time IoT integration unless real-time data "
    "is actually supplied.\n"
    "- Do not claim that the Digital Twin is a complete physical replica.\n"
    "- Do NOT call R2 'accuracy.'\n"
    "- If discussing carbon emissions, clearly distinguish between energy consumption, emission "
    "factors, and estimated CO2/CO2e emissions.\n"
    "- When exact current external statistics are required, do not fabricate them.\n\n"
    "## Response Style\n\n"
    "Answer in simple language suitable for factory managers, hackathon judges, students, "
    "sustainability teams, and non-technical users.\n"
    "Keep answers concise unless the user asks for more detail.\n"
    "For technical questions, explain the technical term first, then give a simple example.\n"
    "Do not unnecessarily mention the system prompt or these internal instructions."
)

# Model to use — confirmed working with this API key
GEMINI_MODEL = "gemini-3.6-flash"


# ---------------------------------------------------------------------------
# Helper: build factory context block
# ---------------------------------------------------------------------------
def _build_context_block(db: Session, factory_id: Optional[int]) -> str:
    """Fetch live factory data and format it as a context block for Gemini."""
    if not factory_id or not db:
        return ""
    try:
        summary = get_factory_summary(db, factory_id)
        if not summary:
            return ""

        anomalies = []
        try:
            anomalies = get_anomalies_tool(db, factory_id) or []
        except Exception:
            pass

        anomaly_status = "Detected" if anomalies else "None detected"
        latest_anomaly = anomalies[0]["reason"] if anomalies else "N/A"

        ctx = (
            "\n\nCURRENT GREENMETRIX FACTORY DATA (use this to give context-specific answers):\n"
            f"  Factory name        : {summary.get('name', 'Unknown')}\n"
            f"  Location / grid     : {summary.get('grid_zone', 'Delhi NCR')}\n"
            f"  Latest energy (kWh) : {summary.get('latest_energy_kwh', 'N/A')}\n"
            f"  Carbon emissions    : {summary.get('latest_co2_kg', 'N/A')} kg CO2\n"
            f"  Emission intensity  : {summary.get('emission_intensity', 'N/A')} kg CO2/unit\n"
            f"  Renewable share     : {summary.get('renewable_share', 'N/A')}%\n"
            f"  Sustainability rating: {summary.get('rating', 'N/A')}\n"
            f"  Active anomalies    : {summary.get('active_anomalies_count', 0)}\n"
            f"  Anomaly status      : {anomaly_status}\n"
            f"  Latest anomaly      : {latest_anomaly}\n"
        )
        return ctx
    except Exception as e:
        logger.warning(f"Could not build factory context: {e}")
        return ""


# ---------------------------------------------------------------------------
# Gemini copilot — uses google-genai (new SDK)
# ---------------------------------------------------------------------------
class GeminiCopilot:
    def __init__(self):
        self._client = None
        self._init_client()

    def _init_client(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key.strip() == "your_gemini_api_key_here" or not api_key.strip():
            logger.warning(
                "GEMINI_API_KEY is not set or is still the placeholder value. "
                "GeminiCopilot will return an error response until a real key is provided."
            )
            return

        try:
            from google import genai

            self._client = genai.Client(api_key=api_key.strip())
            logger.info(f"GeminiCopilot: client initialised (model: {GEMINI_MODEL}).")
        except Exception as exc:
            logger.error(f"GeminiCopilot: failed to initialise client — {exc}")
            self._client = None

    def ask(
        self,
        message: str,
        factory_id: Optional[int] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """
        Send `message` to Gemini with the GreenMetriX system prompt and
        optional factory context.  Returns a dict matching ChatResponse schema.
        """
        if not self._client:
            return {
                "answer": (
                    "GreenMetriX Copilot is temporarily unavailable because "
                    "the AI service is not configured. Please contact your "
                    "administrator to set the GEMINI_API_KEY environment variable."
                ),
                "insights": [],
                "recommendations": [],
                "sources": [],
                "assumptions": [],
                "data_quality": "Unavailable",
                "tool_calls": [],
            }

        # Build context block from live factory data
        context_block = _build_context_block(db, factory_id) if db else ""

        # Compose the user prompt — add factory context if available
        user_prompt = message
        if context_block:
            user_prompt = f"{context_block}\n\nUSER QUESTION:\n{message}"

        try:
            from google.genai import types

            response = self._client.models.generate_content(
                model=GEMINI_MODEL,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=GREENMETRIX_SYSTEM_PROMPT,
                    temperature=0.7,
                    max_output_tokens=1024,
                ),
            )
            answer = response.text.strip()
        except Exception as exc:
            logger.error(f"GeminiCopilot.ask — Gemini API error: {exc}")
            return {
                "answer": (
                    "GreenMetriX Copilot is temporarily unavailable. "
                    "Please try again in a moment."
                ),
                "insights": [],
                "recommendations": [],
                "sources": [],
                "assumptions": [],
                "data_quality": "Unavailable",
                "tool_calls": [],
            }

        return {
            "answer": answer,
            "insights": [],
            "recommendations": [],
            "sources": ["GreenMetriX AI Copilot (Gemini)"],
            "assumptions": [],
            "data_quality": "AI-Generated",
            "tool_calls": [{"tool": "gemini_generate_content", "model": GEMINI_MODEL}],
        }


# Singleton used by the router
gemini_copilot = GeminiCopilot()
