import io
import datetime
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_sustainability_pdf(
    factory_data: Dict[str, Any],
    readings: List[Dict[str, Any]],
    anomalies: List[Dict[str, Any]],
    score_data: Dict[str, Any],
    scenario_data: Optional[Dict[str, Any]] = None
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    primary_color = colors.HexColor("#064e3b")  # Dark emerald
    accent_color = colors.HexColor("#10b981")   # Bright emerald
    text_dark = colors.HexColor("#0f172a")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=primary_color
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569")
    )
    h2_style = ParagraphStyle(
        "Heading2Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "BodyCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=text_dark
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Italic"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b")
    )

    elements = []

    # Header Banner
    elements.append(Paragraph("GREENMETRIX // SUSTAINABILITY REPORT", title_style))
    elements.append(Paragraph("Measure. Predict. Decarbonize. — AI-Powered Sustainability Intelligence", subtitle_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=2, color=accent_color, spaceBefore=2, spaceAfter=12))

    # Meta Table
    gen_time = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    meta_info = [
        [Paragraph("<b>Factory:</b>", body_style), Paragraph(factory_data.get("name", "N/A"), body_style),
         Paragraph("<b>Industry:</b>", body_style), Paragraph(factory_data.get("industry", "N/A"), body_style)],
        [Paragraph("<b>City / Zone:</b>", body_style), Paragraph(f"{factory_data.get('city', 'Delhi')} ({factory_data.get('grid_zone', 'ZONE-A')})", body_style),
         Paragraph("<b>Generated At:</b>", body_style), Paragraph(gen_time, body_style)],
        [Paragraph("<b>Rating:</b>", body_style), Paragraph(f"<b>{factory_data.get('sustainability_rating', 'UNKNOWN')}</b>", body_style),
         Paragraph("<b>Data Status:</b>", body_style), Paragraph("DEMO DATA (Synthetic Benchmark)", body_style)]
    ]
    t_meta = Table(meta_info, colWidths=[80, 185, 80, 185])
    t_meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 12))

    # Executive Summary
    elements.append(Paragraph("1. Executive Summary & KPIs", h2_style))
    kpi_data = [
        ["Metric", "Value", "Classification", "Source / Reference"],
        ["Energy Consumption", f"{factory_data.get('latest_energy_kwh', 0):,.1f} kWh", "MEASURED", "Factory Smart Sub-meter"],
        ["Carbon Emissions", f"{factory_data.get('latest_co2_kg', 0):,.1f} kg CO2", "ESTIMATED", "CEA Baseline Grid Factor (0.716 kg/kWh)"],
        ["Production Volume", f"{factory_data.get('latest_production', 0):,.0f} units", "MEASURED", "Production Output ERP Log"],
        ["Emission Intensity", f"{factory_data.get('latest_intensity', 'UNKNOWN')} kg/unit", "CALCULATED", "CO2 / Production Volume"],
        ["Renewable Energy", f"{factory_data.get('latest_renewable_share', 0):.1f}%", "MEASURED", "On-site Solar Inverter / PPA"],
        ["Composite Score", f"{score_data.get('overall_score', 80.0)}/100 ({score_data.get('grade', 'GOOD')})", "COMPOSITE", "GreenMetriX Assessment Engine"]
    ]
    t_kpi = Table(kpi_data, colWidths=[130, 110, 90, 200])
    t_kpi.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
    ]))
    elements.append(t_kpi)
    elements.append(Spacer(1, 12))

    # Anomaly Detection Section
    elements.append(Paragraph("2. Unsupervised Anomaly Detection (Isolation Forest)", h2_style))
    if anomalies:
        anom_rows = [["Timestamp", "Severity", "Anomaly Score", "Root Cause Reason"]]
        for a in anomalies[:5]:
            anom_rows.append([
                str(a.get("timestamp", ""))[:16],
                str(a.get("severity", "MEDIUM")),
                f"{a.get('anomaly_score', 0.8):.2f}",
                str(a.get("reason", "Potential anomaly requiring investigation."))
            ])
        t_anom = Table(anom_rows, colWidths=[110, 70, 80, 270])
        t_anom.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
        ]))
        elements.append(t_anom)
    else:
        elements.append(Paragraph("No active anomalies detected across the monitored reporting timeframe.", body_style))
    elements.append(Spacer(1, 12))

    # Digital Twin Scenario
    if scenario_data:
        elements.append(Paragraph("3. Digital Twin What-If Simulation Scenario", h2_style))
        scen_rows = [
            ["Parameter", "Current Baseline", "Simulated Scenario", "Net Change"],
            ["Energy Consumption", f"{scenario_data.get('baseline_energy_kwh', 0):,.1f} kWh", f"{scenario_data.get('scenario_energy_kwh', 0):,.1f} kWh", f"{scenario_data.get('scenario_energy_kwh', 0) - scenario_data.get('baseline_energy_kwh', 0):,.1f} kWh"],
            ["CO2 Emissions", f"{scenario_data.get('baseline_co2_kg', 0):,.1f} kg", f"{scenario_data.get('scenario_co2_kg', 0):,.1f} kg", f"-{scenario_data.get('potential_reduction_co2_kg', 0):,.1f} kg ({scenario_data.get('potential_reduction_pct', 0)}%)"],
            ["Sustainability Rating", scenario_data.get("baseline_rating", "MEDIUM"), scenario_data.get("scenario_rating", "LOW"), "Rating Improvement"]
        ]
        t_scen = Table(scen_rows, colWidths=[120, 130, 130, 150])
        t_scen.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#065f46")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
        ]))
        elements.append(t_scen)
        elements.append(Spacer(1, 12))

    # Methodology & Disclaimers
    elements.append(Paragraph("4. Methodology & Compliance Notice", h2_style))
    elements.append(Paragraph(
        "<b>Grid Emission Factor:</b> Central Electricity Authority (CEA) Baseline Database v19.0 (0.716 kg CO₂/kWh). "
        "Emission calculations follow GHG Protocol Corporate Accounting Standard Scope 2 Location-Based guidance.",
        disclaimer_style
    ))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        "<b>Intensity Formula:</b> Emission Intensity = CO₂ (kg) / Production (units). When production is zero or unavailable, "
        "intensity is marked UNKNOWN to prevent division by zero. Ratings use configurable industrial demo benchmarks.",
        disclaimer_style
    ))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        "<b>Legal Notice:</b> Demo locations and synthetic values are illustrative. Real-world commercial deployment requires "
        "verified smart metering and calibrated telemetry.",
        disclaimer_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
