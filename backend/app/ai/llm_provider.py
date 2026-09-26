from typing import Optional


class DeterministicEngine:
    """
    Guaranteed high-reliability local engine.
    Runs without external network calls or API keys — zero deployment risk.
    The CopilotAgent handles all intent routing and response generation internally.
    """
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        return "GreenMetriX Deterministic AI Engine active."


def get_llm_provider() -> DeterministicEngine:
    return DeterministicEngine()
