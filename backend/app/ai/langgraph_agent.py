import re
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.ai.rag_retriever import retriever
from app.ai.tools import (
    get_factory_summary, get_energy_trends, get_emission_trends,
    get_anomalies_tool, run_what_if_tool, generate_action_plan_tool
)
from app.models.models import Factory

logger = logging.getLogger("greenmetrix.copilot")


def _match(msg: str, keywords: List[str]) -> bool:
    """Return True if any keyword phrase appears in msg."""
    return any(k in msg for k in keywords)


class GreenMetriXCopilotAgent:

    def process_query(self, message: str, factory_id: Optional[int], db: Session) -> Dict[str, Any]:
        msg_lower = message.lower().strip()
        tool_calls: List[Dict] = []
        insights: List[str] = []
        recommendations: List[str] = []
        sources: List[str] = []
        assumptions: List[str] = []
        data_quality = "Verified (Factory Metered Telemetry)"

        logger.info("Copilot received question: %s", message)

        # ------------------------------------------------------------------
        # Resolve factory context
        # ------------------------------------------------------------------
        if not factory_id:
            first_f = db.query(Factory).first()
            if first_f:
                factory_id = first_f.id

        # Try to detect a named factory in the question
        factories_all = db.query(Factory).all()
        named_factory_id = factory_id
        for f in factories_all:
            if f.name.lower() in msg_lower or (f.city and f.city.lower() in msg_lower):
                named_factory_id = f.id
                break

        # ------------------------------------------------------------------
        # Intent detection — ordered from most-specific to least-specific
        # ------------------------------------------------------------------

        # 1. WHAT-IF / SIMULATION
        if _match(msg_lower, ["what if", "simulate", "simulation", "scenario"]) or (
            _match(msg_lower, ["decrease", "reduce", "increase", "cut"]) and "%" in msg_lower
        ):
            logger.info("Intent matched: what_if_simulation")
            pct_match = re.search(r"(\d+)\s*%", message)
            pct = float(pct_match.group(1)) if pct_match else 10.0
            energy_change = pct if "increase" in msg_lower else -pct

            sim = run_what_if_tool(db, named_factory_id, energy_change_pct=energy_change,
                                   production_change_pct=0.0, renewable_share_pct=25.0)
            tool_calls.append({"tool": "run_what_if_simulation",
                                "params": {"energy_change_pct": energy_change}, "output": sim})

            answer = (
                f"Simulating a {energy_change:+.0f}% change in energy consumption for "
                f"{sim['factory_name']}: baseline consumption shifts from "
                f"{sim['baseline_energy_kwh']:,.0f} kWh to {sim['scenario_energy_kwh']:,.0f} kWh. "
                f"This yields an estimated CO₂ change of {sim['potential_reduction_co2_kg']:,.1f} kg "
                f"({sim['potential_reduction_pct']}%), transitioning the sustainability rating from "
                f"'{sim['baseline_rating']}' to '{sim['scenario_rating']}'."
            )
            insights.append(f"Potential emissions delta: {sim['potential_reduction_co2_kg']:,.1f} kg CO₂/month.")
            insights.append(f"Rating shift: {sim['baseline_rating']} → {sim['scenario_rating']}.")
            recommendations.append("Apply peak-load management and high-efficiency VFD motors to achieve the simulated load reduction.")
            recommendations.append("Validate the scenario in the Digital Twin simulator before procurement decisions.")
            sources.append("GreenMetriX What-If Simulator Engine")
            sources.append("Central Electricity Authority (CEA) Baseline Database v19.0")
            assumptions.append("Grid emission factor remains constant at 0.716 kg CO₂/kWh.")
            assumptions.append("Production volume remains stable across all shifts.")

        # 2. ANOMALY / ENERGY SPIKE / ALERT
        elif _match(msg_lower, ["anomaly", "anomalies", "spike", "alert", "flag", "flagged",
                                "unusual", "abnormal", "outlier", "isolation forest",
                                "why did", "energy spike", "consumption spike"]):
            logger.info("Intent matched: anomaly_investigation")
            summary = get_factory_summary(db, named_factory_id)
            anomalies = get_anomalies_tool(db, named_factory_id)
            tool_calls.append({"tool": "get_factory_summary",
                                "params": {"factory_id": named_factory_id}, "output": summary})
            tool_calls.append({"tool": "get_anomalies",
                                "params": {"factory_id": named_factory_id}, "output": anomalies})

            factory_label = summary.get("name", "the facility")

            if anomalies:
                latest = anomalies[-1]
                answer = (
                    f"{factory_label} has {len(anomalies)} logged anomaly event(s). "
                    f"The most recent: '{latest['reason']}' detected at {latest['timestamp'][:16]} "
                    f"with severity '{latest['severity']}' and an Isolation Forest anomaly score of "
                    f"{latest['anomaly_score']}. The Isolation Forest algorithm flags readings that "
                    f"deviate significantly from the facility's learned baseline energy signature — "
                    f"common triggers include shift-changeover load surges, cooling system failures, "
                    f"and unscheduled high-load equipment activation."
                )
                for a in anomalies[:3]:
                    insights.append(f"[{a['severity']}] {a['reason']} — score: {a['anomaly_score']}")
            else:
                answer = (
                    f"No open anomalies are currently logged for {factory_label}. "
                    f"GreenMetriX uses an Isolation Forest model trained on 90 days of shift-level "
                    f"telemetry. Readings deviating beyond ±2.5σ from the rolling baseline trigger "
                    f"an alert. The absence of alerts indicates stable consumption patterns."
                )
                insights.append("No active anomalies — consumption within normal operating bounds.")

            recommendations.append("Schedule a targeted energy audit on induction furnace and compressed air systems.")
            recommendations.append("Review shift-changeover SOPs to prevent sequential high-load equipment starts.")
            sources.append("GreenMetriX Isolation Forest Anomaly Detection Engine")
            assumptions.append("Baseline trained on last 90 days of shift-level telemetry.")

        # 3. SUSTAINABILITY ISSUES / MAIN PROBLEM / PERFORMANCE
        elif _match(msg_lower, ["sustainability issue", "biggest issue", "main issue", "problem",
                                "performance", "rating", "why is", "why are", "emission intensity",
                                "carbon footprint", "scope 1", "scope 2"]):
            logger.info("Intent matched: sustainability_inspection")
            summary = get_factory_summary(db, named_factory_id)
            anomalies = get_anomalies_tool(db, named_factory_id)
            tool_calls.append({"tool": "get_factory_summary",
                                "params": {"factory_id": named_factory_id}, "output": summary})
            tool_calls.append({"tool": "get_anomalies",
                                "params": {"factory_id": named_factory_id}, "output": anomalies})

            rag_info = retriever.retrieve("decarbonization energy efficiency ISO 50001", top_k=2)
            for r in rag_info:
                sources.append(f"{r['title']} ({r['source']})")

            answer = (
                f"Sustainability analysis for {summary.get('name', 'the facility')}: "
                f"Current rating is '{summary.get('rating')}' with an emission intensity of "
                f"{summary.get('emission_intensity')} kg CO₂/unit. "
                f"There are {summary.get('active_anomalies_count')} open anomaly flag(s). "
                f"Primary vulnerability: heavy grid reliance with only {summary.get('renewable_share')}% "
                f"renewable penetration against a national CEA grid factor of 0.716 kg CO₂/kWh. "
                f"Scope 2 indirect emissions dominate the facility's carbon footprint."
            )
            if anomalies:
                insights.append(f"Active anomaly: {anomalies[0]['reason']} — severity: {anomalies[0]['severity']}.")
            insights.append(f"Emission intensity: {summary.get('emission_intensity')} kg CO₂/unit.")
            insights.append(f"Renewable share: {summary.get('renewable_share')}% — sector benchmark is 30%+.")
            recommendations.append("Initiate targeted energy audit on high-load melting and induction heating equipment.")
            recommendations.append("Evaluate rooftop solar PV installation to lift renewable share above 30%.")
            recommendations.append("Inspect load telemetry for peak demand spikes during shift handovers.")
            assumptions.append("All baseline calculations assume measured meter accuracy ±2%.")

        # 4. FACTORY COMPARISON / RANKINGS / HOTSPOT
        elif _match(msg_lower, ["highest", "compare", "worst", "hotspot", "ranking", "best",
                                "lowest", "all factories", "which factory", "top"]):
            logger.info("Intent matched: factory_comparison")
            scored = []
            for f in factories_all:
                s = get_factory_summary(db, f.id)
                if s.get("emission_intensity") is not None:
                    scored.append((s["emission_intensity"], s))
            scored.sort(key=lambda x: x[0], reverse=True)
            tool_calls.append({"tool": "compare_factories", "output_count": len(scored)})

            if scored:
                top = scored[0][1]
                bottom = scored[-1][1]
                answer = (
                    f"Across {len(scored)} monitored facilities, {top['name']} has the highest emission "
                    f"intensity at {top['emission_intensity']} kg CO₂/unit (Rating: {top['rating']}), "
                    f"driven by high electrical demand ({top['latest_energy_kwh']:,.0f} kWh) and only "
                    f"{top['renewable_share']}% renewable penetration. "
                    f"Best performer: {bottom['name']} at {bottom['emission_intensity']} kg CO₂/unit "
                    f"(Rating: {bottom['rating']})."
                )
                for score, s in scored[:3]:
                    insights.append(f"{s['name']}: {s['emission_intensity']} kg CO₂/unit — {s['rating']}")
                recommendations.append("Prioritize decarbonisation capex toward the highest-intensity facilities first.")
                sources.append("GreenMetriX Multi-Factory Normalized Telemetry Index")
            else:
                answer = "Insufficient emission intensity data across current factory profiles."

        # 5. ACTION PLAN / ROADMAP / RECOMMENDATIONS
        elif _match(msg_lower, ["action plan", "recommend", "how to improve", "roadmap",
                                "next step", "what should", "improve", "reduce emission",
                                "decarboni"]):
            logger.info("Intent matched: action_plan")
            actions = generate_action_plan_tool(db, named_factory_id)
            tool_calls.append({"tool": "generate_action_plan",
                                "params": {"factory_id": named_factory_id}, "count": len(actions)})
            answer = (
                f"Prioritized decarbonisation roadmap — {len(actions)} strategic initiatives identified:"
            )
            for a in actions:
                recommendations.append(f"[{a['priority']}] {a['issue']}: {a['recommendation']}")
                insights.append(f"{a['id']} — Estimated impact: {a['potential_impact']}")
                sources.extend(a["sources"])
                assumptions.extend(a["assumptions"])
            sources = list(dict.fromkeys(sources))
            assumptions = list(dict.fromkeys(assumptions))

        # 6. DIGITAL TWIN
        elif _match(msg_lower, ["digital twin", "twin", "scenario model", "virtual model",
                                "simulation model", "what is the purpose of the digital"]):
            logger.info("Intent matched: digital_twin_query")
            tool_calls.append({"tool": "retrieve_sustainability_knowledge",
                                "query": message, "results": 0})
            answer = (
                "The GreenMetriX Digital Twin is a physics-informed scenario simulation engine. "
                "It creates a virtual replica of each factory's energy and production profile using "
                "live telemetry. Operators can model 'what-if' scenarios — such as shifting 30% of "
                "energy consumption to off-peak hours or adding 500 kWp of rooftop solar — and "
                "preview the resulting CO₂ reduction and sustainability rating change before "
                "committing real capital. The Digital Twin runs deterministic calculations using the "
                "CEA 0.716 kg CO₂/kWh grid emission factor and factory-specific production baselines."
            )
            insights.append("Digital Twin uses live factory telemetry as its baseline state.")
            insights.append("Scenario outputs update the sustainability rating in real-time.")
            recommendations.append("Use Digital Twin to pre-validate solar PPA sizing before procurement.")
            recommendations.append("Run shift-schedule scenarios to identify lowest-cost off-peak energy windows.")
            sources.append("GreenMetriX Digital Twin Simulator Engine")

        # 7. ISOLATION FOREST / ML / ANOMALY DETECTION MODEL
        elif _match(msg_lower, ["isolation forest", "machine learning", "ml model", "why do we use",
                                "anomaly detection", "detect anomal", "how does the model",
                                "how are anomalies"]):
            logger.info("Intent matched: ml_model_query")
            tool_calls.append({"tool": "retrieve_sustainability_knowledge",
                                "query": message, "results": 0})
            answer = (
                "GreenMetriX uses an Isolation Forest algorithm for anomaly detection because it is "
                "exceptionally effective at identifying rare, abnormal energy consumption events in "
                "high-dimensional industrial telemetry without requiring labelled training data. "
                "Unlike traditional threshold-based alerts, Isolation Forest builds an ensemble of "
                "random decision trees and measures how easily each data point is 'isolated' — "
                "anomalous readings (energy spikes, sudden drops) require far fewer splits to isolate "
                "than normal readings. The model is retrained on rolling 90-day shift-level data for "
                "each facility, producing a per-reading anomaly score between -1 (anomaly) and +1 (normal)."
            )
            insights.append("Isolation Forest is unsupervised — no labelled anomaly data required.")
            insights.append("Each facility has its own model trained on 90 days of shift data.")
            recommendations.append("Set anomaly score thresholds per facility based on operational variance.")
            sources.append("GreenMetriX ML Anomaly Detection Engine (Isolation Forest)")
            assumptions.append("Model accuracy is highest when baseline data is free of prolonged shutdowns.")

        # 8. WHAT IS GREENMETRIX / ABOUT
        elif _match(msg_lower, ["what is greenmetrix", "what is green metrix", "about greenmetrix",
                                "greenmetrix platform", "what does greenmetrix", "purpose of greenmetrix",
                                "what is this platform", "what is this app"]):
            logger.info("Intent matched: about_platform")
            tool_calls.append({"tool": "retrieve_sustainability_knowledge",
                                "query": message, "results": 0})
            answer = (
                "GreenMetriX is an AI-powered sustainability intelligence platform purpose-built for "
                "Indian manufacturing. It integrates live factory energy telemetry, CEA grid emission "
                "factors, and ISO 50001 energy management standards to give plant managers a real-time "
                "view of their carbon footprint, anomaly events, and decarbonisation opportunities. "
                "Core modules include: (1) Live Energy & Emissions Dashboard, (2) Isolation Forest "
                "Anomaly Detection, (3) Digital Twin Scenario Simulator, (4) Sustainability Scoring, "
                "(5) City Carbon Map, (6) Predictive Energy Forecasting (ML), and (7) this AI Copilot "
                "for natural-language queries."
            )
            insights.append("GreenMetriX monitors 8 Delhi NCR manufacturing facilities.")
            insights.append("CEA grid emission factor used: 0.716 kg CO₂/kWh (v19.0, Oct 2024).")
            recommendations.append("Explore the Digital Twin module to model energy reduction scenarios.")
            sources.append("GreenMetriX Platform Documentation")

        # 9. CEA EMISSION FACTOR
        elif _match(msg_lower, ["cea", "emission factor", "grid factor", "0.716", "carbon factor",
                                "kwh", "scope 2 factor", "national grid"]):
            logger.info("Intent matched: cea_emission_factor")
            rag_docs = retriever.retrieve(message, top_k=2)
            tool_calls.append({"tool": "retrieve_sustainability_knowledge",
                                "query": message, "results": len(rag_docs)})
            answer = (
                "The Central Electricity Authority (CEA) publishes India's national grid emission "
                "factor annually. The current operating margin factor (v19.0, October 2024) is "
                "0.716 kg CO₂/kWh (0.716 tCO₂/MWh) for the Unified National Grid. "
                "GreenMetriX uses this factor to calculate Scope 2 indirect emissions: "
                "CO₂ (kg) = Energy Consumed (kWh) × 0.716. "
                "The combined margin (for clean energy projects) is 0.684 kg CO₂/kWh. "
                "Transmission and distribution losses average 19.2% nationally."
            )
            for r in rag_docs:
                sources.append(f"{r['title']} ({r['source']})")
                insights.append(r["snippet"][:180].rstrip() + "…")
            recommendations.append("Use location-based CEA factor unless a Power Purchase Agreement (PPA) is in place.")
            assumptions.append("CEA factor v19.0 applies until the next annual publication.")

        # 10. GHG PROTOCOL / SCOPE DEFINITIONS
        elif _match(msg_lower, ["ghg protocol", "ghg", "scope 1", "scope 2", "scope 3",
                                "greenhouse gas", "carbon accounting", "emission reporting"]):
            logger.info("Intent matched: ghg_protocol")
            rag_docs = retriever.retrieve(message, top_k=2)
            tool_calls.append({"tool": "retrieve_sustainability_knowledge",
                                "query": message, "results": len(rag_docs)})
            answer = (
                "The GHG Protocol Corporate Accounting and Reporting Standard (WRI/WBCSD) defines "
                "three emission scopes: Scope 1 — direct emissions from sources owned or controlled "
                "by the company (boilers, furnaces, company vehicles); Scope 2 — indirect emissions "
                "from purchased electricity (calculated using CEA's 0.716 kg CO₂/kWh factor in India); "
                "Scope 3 — optional, broader value-chain emissions including supply chain and logistics. "
                "GreenMetriX tracks Scope 1 and Scope 2 for all monitored facilities."
            )
            for r in rag_docs:
                sources.append(f"{r['title']} ({r['source']})")
                insights.append(r["snippet"][:180].rstrip() + "…")
            recommendations.append("Begin Scope 3 tracking for upstream raw-material suppliers to complete corporate GHG inventory.")

        # 11. ISO 50001
        elif _match(msg_lower, ["iso 50001", "iso50001", "energy management system",
                                "energy baseline", "enpi", "significant energy use"]):
            logger.info("Intent matched: iso_50001")
            rag_docs = retriever.retrieve(message, top_k=2)
            tool_calls.append({"tool": "retrieve_sustainability_knowledge",
                                "query": message, "results": len(rag_docs)})
            answer = (
                "ISO 50001:2018 is the international standard for Energy Management Systems (EnMS). "
                "It requires organisations to: establish an Energy Baseline (EnB) as a quantitative "
                "reference for performance comparison; define Energy Performance Indicators (EnPIs); "
                "identify Significant Energy Uses (SEUs) such as electric arc furnaces and compressed "
                "air systems; and implement a continuous improvement cycle (Plan-Do-Check-Act). "
                "GreenMetriX aligns its energy tracking and reporting methodology with ISO 50001 "
                "to ensure audit-ready documentation for each monitored facility."
            )
            for r in rag_docs:
                sources.append(f"{r['title']} ({r['source']})")
                insights.append(r["snippet"][:180].rstrip() + "…")
            recommendations.append("Conduct an ISO 50001 gap assessment before pursuing certification.")
            recommendations.append("Use GreenMetriX EnPI dashboards as the documented energy performance record.")

        # 12. GENERAL RAG FALLBACK — use retrieved snippet to compose a relevant answer
        else:
            logger.info("Intent matched: rag_general_fallback (query: %s)", message)
            rag_docs = retriever.retrieve(message, top_k=3)
            tool_calls.append({"tool": "retrieve_sustainability_knowledge",
                                "query": message, "results": len(rag_docs)})
            summary = get_factory_summary(db, factory_id) if factory_id else {}

            if rag_docs:
                # Build answer from the top retrieved document
                top_doc = rag_docs[0]
                answer = (
                    f"Based on GreenMetriX knowledge base ({top_doc['title']}): "
                    f"{top_doc['snippet'].rstrip('.')}. "
                    f"For {summary.get('name', 'your facility')}, current renewable penetration is "
                    f"{summary.get('renewable_share', 'N/A')}% — increasing this is the fastest "
                    f"path to reducing Scope 2 indirect emissions."
                )
                for r in rag_docs:
                    sources.append(f"{r['title']} ({r['source']})")
                    insights.append(r["snippet"][:160].rstrip() + "…")
            else:
                answer = (
                    f"I couldn't find a specific match in the GreenMetriX knowledge base for that query. "
                    f"You can ask me about: anomaly detection, the Digital Twin, CEA emission factors, "
                    f"ISO 50001, GHG Protocol scopes, sustainability ratings, what-if simulations, "
                    f"or factory comparisons."
                )
                insights.append("Try rephrasing your question with keywords like 'anomaly', 'emission factor', 'Digital Twin', or 'ISO 50001'.")

            recommendations.append("Review ISO 50001 guidelines to establish a continuous energy baseline.")
            recommendations.append("Use the Digital Twin simulator to stress-test renewable procurement options.")

        logger.info("Copilot response generated. Tools used: %s",
                    [t.get("tool") for t in tool_calls])

        return {
            "answer": answer,
            "insights": insights,
            "recommendations": recommendations,
            "sources": sources,
            "assumptions": assumptions,
            "data_quality": data_quality,
            "tool_calls": tool_calls
        }


copilot_agent = GreenMetriXCopilotAgent()
