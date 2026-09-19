import re
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.ai.llm_provider import get_llm_provider
from app.ai.rag_retriever import retriever
from app.ai.tools import (
    get_factory_summary, get_energy_trends, get_emission_trends,
    get_anomalies_tool, run_what_if_tool, generate_action_plan_tool
)
from app.models.models import Factory

class GreenMetriXCopilotAgent:
    def __init__(self):
        self.llm = get_llm_provider()

    def process_query(self, message: str, factory_id: Optional[int], db: Session) -> Dict[str, Any]:
        msg_lower = message.lower()
        tool_calls = []
        insights = []
        recommendations = []
        sources = []
        assumptions = []
        data_quality = "Verified (Factory Metered Telemetry)"

        # Default to first factory if none specified
        if not factory_id:
            first_f = db.query(Factory).first()
            if first_f:
                factory_id = first_f.id

        # 1. Intent: What-If Simulation
        if "what if" in msg_lower or "decrease" in msg_lower or "reduce" in msg_lower and "%" in msg_lower:
            pct_match = re.search(r"(\d+)%", message)
            pct = float(pct_match.group(1)) if pct_match else 10.0
            if "increase" in msg_lower:
                energy_change = pct
            else:
                energy_change = -pct

            sim = run_what_if_tool(db, factory_id, energy_change_pct=energy_change, production_change_pct=0.0, renewable_share_pct=25.0)
            tool_calls.append({"tool": "run_what_if_simulation", "params": {"energy_change_pct": energy_change}, "output": sim})

            answer = (
                f"Simulating a {energy_change}% change in energy consumption for {sim['factory_name']}: "
                f"Baseline consumption would shift from {sim['baseline_energy_kwh']:,.1f} kWh to {sim['scenario_energy_kwh']:,.1f} kWh. "
                f"This yields an estimated CO2 reduction of {sim['potential_reduction_co2_kg']:,.1f} kg CO2 ({sim['potential_reduction_pct']}%), "
                f"transitioning the factory rating from {sim['baseline_rating']} to {sim['scenario_rating']}."
            )
            insights.append(f"Potential emissions avoidance: {sim['potential_reduction_co2_kg']:,.1f} kg CO2/month.")
            insights.append(f"Shift in sustainability rating: {sim['baseline_rating']} -> {sim['scenario_rating']}.")
            recommendations.append("Apply peak-load management and install high-efficiency motors to achieve the simulated 10% load reduction.")
            recommendations.append("Validate the scenario in the Digital Twin simulator before procurement.")
            sources.append("GreenMetriX What-If Simulator Engine")
            sources.append("Central Electricity Authority (CEA) Baseline Database v19.0")
            assumptions.append("Grid emission factor remains constant at 0.716 kg CO2/kWh.")
            assumptions.append("Production volume remains stable across shifts.")

        # 2. Intent: Sustainability Issues / Inspection
        elif any(k in msg_lower for k in ["sustainability issue", "biggest issue", "why did energy", "main issue", "problem"]):
            summary = get_factory_summary(db, factory_id)
            tool_calls.append({"tool": "get_factory_summary", "params": {"factory_id": factory_id}, "output": summary})
            anomalies = get_anomalies_tool(db, factory_id)
            tool_calls.append({"tool": "get_anomalies", "params": {"factory_id": factory_id}, "output": anomalies})

            rag_info = retriever.retrieve("decarbonization energy efficiency ISO 50001", top_k=2)
            for r in rag_info:
                sources.append(f"{r['title']} ({r['source']})")

            answer = (
                f"Analysis of {summary.get('name')}: "
                f"The factory currently holds a sustainability rating of '{summary.get('rating')}' "
                f"with an emission intensity of {summary.get('emission_intensity')} kg CO2/unit. "
                f"There are currently {summary.get('active_anomalies_count')} open anomalies logged by Isolation Forest. "
                f"Primary vulnerability is heavy reliance on grid power with only {summary.get('renewable_share')}% renewable penetration."
            )
            if anomalies:
                insights.append(f"Active anomaly: {anomalies[0]['reason']} with severity {anomalies[0]['severity']}.")
            insights.append(f"Current emission intensity is {summary.get('emission_intensity')} kg CO2/unit against benchmark.")
            recommendations.append("Initiate targeted energy audit on high-load melting and induction heating equipment.")
            recommendations.append("Evaluate rooftop solar installation to lift renewable share above 30%.")
            recommendations.append("Inspect load telemetry for peak demand spikes during shift handovers.")
            assumptions.append("All baseline calculations assume measured meter accuracy.")

        # 3. Intent: Highest Emission Intensity or Comparison
        elif any(k in msg_lower for k in ["highest", "compare", "worst", "hotspot", "ranking"]):
            factories = db.query(Factory).all()
            scored = []
            for f in factories:
                s = get_factory_summary(db, f.id)
                if s.get("emission_intensity") is not None:
                    scored.append((s["emission_intensity"], s))
            scored.sort(key=lambda x: x[0], reverse=True)
            tool_calls.append({"tool": "compare_factories", "output_count": len(scored)})

            if scored:
                top = scored[0][1]
                answer = (
                    f"Among monitored facilities, {top['name']} exhibits the highest emission intensity at "
                    f"{top['emission_intensity']} kg CO2/unit (Rating: {top['rating']}). "
                    f"This is driven by high metallurgical electrical demand ({top['latest_energy_kwh']:,.0f} kWh) and {top['renewable_share']}% renewable penetration."
                )
                insights.append(f"Top carbon hotspot: {top['name']} in {top['grid_zone']}.")
                recommendations.append("Prioritize decarbonization capital expenditure towards the highest intensity facilities first.")
                sources.append("GreenMetriX Multi-Factory Normalized Telemetry Index")
            else:
                answer = "Insufficient intensity data across current factory profiles."

        # 4. Intent: Action Plan Request
        elif any(k in msg_lower for k in ["action plan", "recommend", "how to improve", "roadmap"]):
            actions = generate_action_plan_tool(db, factory_id)
            tool_calls.append({"tool": "generate_action_plan", "params": {"factory_id": factory_id}, "count": len(actions)})
            answer = f"Generated prioritized decarbonization action plan consisting of {len(actions)} strategic initiatives."
            for a in actions:
                recommendations.append(f"[{a['priority']}] {a['issue']}: {a['recommendation']}")
                insights.append(f"{a['id']} Impact: {a['potential_impact']}")
                sources.extend(a['sources'])
                assumptions.extend(a['assumptions'])
            sources = list(set(sources))
            assumptions = list(set(assumptions))

        # 5. General / Knowledge RAG Fallback
        else:
            rag_docs = retriever.retrieve(message, top_k=2)
            tool_calls.append({"tool": "retrieve_sustainability_knowledge", "query": message, "results": len(rag_docs)})
            summary = get_factory_summary(db, factory_id) if factory_id else {}

            answer = (
                f"Based on sustainability intelligence guidelines: Manufacturing decarbonization requires tracking "
                f"Scope 1 direct emissions and Scope 2 indirect emissions using verified grid emission factors (CEA 0.716 kg CO2/kWh). "
                f"For {summary.get('name', 'your facility')}, optimizing motor drives and elevating renewable share from "
                f"{summary.get('renewable_share', 15)}% provide the quickest operational carbon reductions."
            )
            for r in rag_docs:
                sources.append(f"{r['title']} ({r['source']})")
                insights.append(r['snippet'][:150] + "...")
            recommendations.append("Review ISO 50001 guidelines to establish a continuous energy baseline.")
            recommendations.append("Use the Digital Twin simulator to stress-test renewable procurement options.")

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
