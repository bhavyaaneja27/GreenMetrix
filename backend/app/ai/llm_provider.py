import os
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger("greenmetrix.ai")

class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        pass

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        except Exception as e:
            logger.error(f"Error configuring GeminiProvider: {e}")
            self.model = None

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.model:
            raise RuntimeError("Gemini model not initialized.")
        full_prompt = f"{system_prompt}\n\nUser: {prompt}" if system_prompt else prompt
        res = self.model.generate_content(full_prompt)
        return res.text

class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "llama3"):
        self.base_url = base_url
        self.model_name = model_name

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "system": system_prompt or "",
            "stream": False
        }
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json().get("response", "")

class DeterministicEngine(LLMProvider):
    """
    Guaranteed high-reliability local engine for hackathons/demos.
    Runs without external network calls or API keys, ensuring zero crashes.
    """
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        # Returns a structured default text payload if directly invoked
        return "Deterministic GreenMetriX AI Engine active."

def get_llm_provider() -> LLMProvider:
    provider_name = settings.LLM_PROVIDER.lower()
    if provider_name == "gemini" and settings.GEMINI_API_KEY:
        try:
            return GeminiProvider(settings.GEMINI_API_KEY)
        except Exception as e:
            logger.warning(f"Failed to start Gemini, falling back to Deterministic: {e}")
            return DeterministicEngine()
    elif provider_name == "ollama":
        return OllamaProvider(settings.OLLAMA_BASE_URL)
    return DeterministicEngine()
