import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header line
        self.setStrokeColor(colors.HexColor("#064e3b"))
        self.setLineWidth(0.5)
        self.line(54, 750, 558, 750)
        self.drawString(54, 755, "GreenMetriX — Hackathon Defense & Executive Technical Masterclass")
        
        # Footer
        self.line(54, 45, 558, 45)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.drawString(54, 32, "CONFIDENTIAL // SUSTAINABILITY INTELLIGENCE PLATFORM")
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=60,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#10b981')
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#94a3b8')
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#065f46'),
        spaceBefore=12,
        spaceAfter=5
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1e293b')
    )

    q_style = ParagraphStyle(
        'Question',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor('#047857')
    )

    a_style = ParagraphStyle(
        'Answer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#334155')
    )

    future_title_style = ParagraphStyle(
        'FutureTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0f766e')
    )

    story = []

    # Title Banner
    story.append(Paragraph("GreenMetriX // Hackathon Defense Guide", title_style))
    story.append(Paragraph("<b>Measure. Predict. Decarbonize.</b> — AI-Powered Sustainability Intelligence for Smart Manufacturing", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#10b981'), spaceBefore=2, spaceAfter=10))

    # Executive Overview Section
    story.append(Paragraph("1. Executive Summary & Problem-Solution Fit", h1_style))
    overview_p = """<b>GreenMetriX</b> is an enterprise AI platform engineered to solve industrial decarbonization challenges across smart manufacturing hubs. It bridges the gap between hardware telemetry and ESG compliance by combining <b>real-time sub-metered ingestion</b>, <b>CEA Version 20.0 grid factor verification (0.716 kg CO2/kWh)</b>, <b>machine learning forecasting (Gradient Boosting R² = 0.9891)</b>, <b>unsupervised anomaly detection (Isolation Forest)</b>, and an <b>interactive Digital Twin What-If physics simulator</b>."""
    story.append(Paragraph(overview_p, body_style))
    story.append(Spacer(1, 6))

    # Dataset Specifications Table
    story.append(Paragraph("2. Dataset & ML Architecture Specifications", h1_style))
    
    data_table_data = [
        [Paragraph("<b>Parameter</b>", q_style), Paragraph("<b>Specification & Technical Detail</b>", q_style)],
        [Paragraph("Dataset Rows", body_style), Paragraph("4,320 chronological hourly telemetry records (180 continuous days)", body_style)],
        [Paragraph("Facilities Monitored", body_style), Paragraph("8 industrial plants across Delhi NCR (Okhla, Noida, Bawana, Faridabad, Gurugram, Manesar, Patparganj, Mayapuri)", body_style)],
        [Paragraph("Primary Features", body_style), Paragraph("Production Units, Energy kWh, Ambient Temp, Humidity, CDD, Shift Count, CEA Grid Baseline", body_style)],
        [Paragraph("Zero-Division Safeguard", body_style), Paragraph("Includes idle facilities (0 production) — strictly returns UNKNOWN rating with 0 division error", body_style)],
        [Paragraph("Champion ML Model", body_style), Paragraph("Gradient Boosting Regressor (Test RMSE: 59.94, MAE: 41.15, R²: 0.9891)", body_style)],
        [Paragraph("Anomaly Model", body_style), Paragraph("Unsupervised Isolation Forest (contamination=0.05, 100 trees) for equipment leak detection", body_style)],
        [Paragraph("RAG Standards Ingested", body_style), Paragraph("CEA Grid Baseline Ver 20.0, GHG Protocol Corporate Standard, ISO 50001 Energy Indicators", body_style)]
    ]
    t = Table(data_table_data, colWidths=[130, 374])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ecfdf5')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#10b981')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    # Hackathon Defense Q&A
    story.append(Paragraph("3. Top 10 Hackathon Judge Questions & Winning Answers", h1_style))

    qa_list = [
        (
            "Q1: What exact problem does GreenMetriX solve that traditional ERP or SCADA systems don't?",
            "Traditional SCADA systems only show raw kilowatt-hours (kWh) without carbon context, and annual ESG consultants take 3 to 6 months to compile Scope 1-3 reports. GreenMetriX bridges this by translating raw telemetry into real-time CEA-verified emission intensity (kg CO2/unit) and providing prescriptive AI what-if simulations before factory managers spend CAPEX."
        ),
        (
            "Q2: How do you prevent division by zero when a factory is idling with 0 production output?",
            "We engineered a strict Zero-Division Safeguard in our Intensity Service: when production units == 0 or missing, the system does not divide. Instead, it marks the emission rating as 'UNKNOWN' with a human-readable audit reason ('Zero or missing production: intensity undefined') and categorizes the draw as standby baseload."
        ),
        (
            "Q3: Why did you choose Gradient Boosting over Deep Learning (LSTM/Transformers) for energy forecasting?",
            "Across 4,320 chronological hourly samples, Gradient Boosting achieved an R² score of 0.9891 and RMSE of 59.94, outperforming Random Forest and XGBoost. Tabular industrial time-series with weather and shift regressors thrives on tree-based gradient boosters while executing inference in under 3 milliseconds on standard CPUs without GPU latency."
        ),
        (
            "Q4: What emission factor do you use for Indian Grid electricity, and why?",
            "We use the Central Electricity Authority (CEA) CO2 Baseline Database for the Indian Power Sector (Version 20.0), which establishes the weighted grid factor of 0.716 kg CO2/kWh for the Northern Regional Grid. The platform also allows dynamic administrator updates in Settings if the CEA publishes new gazettes."
        ),
        (
            "Q5: How does your Isolation Forest Anomaly Detection work in real-time?",
            "We trained an unsupervised Isolation Forest with a 5% contamination factor on multi-dimensional telemetry (Energy kWh, Active Shifts, CDD, Operating Temp). When an anomaly score drops below -0.40, the system flags the spike, isolates the metric, and maps it against equipment failure heuristics (e.g., chiller valve jams or furnace coil degradation)."
        ),
        (
            "Q6: How does the Digital Twin calculate financial ROI and payback periods?",
            "The Digital Twin combines physical thermodynamic equations with energy tariff matrices. For example, Solar PV generates kWh based on solar irradiance (1,400 kWh/kWp in NCR), saving 0.716 kg CO2/kWh. We multiply saved kWh by industrial peak tariffs (₹8.5/kWh or $0.10/kWh) and calculate Simple Payback: CAPEX / (Annual OPEX Savings + Carbon Offset Value)."
        ),
        (
            "Q7: How is your AI Copilot preventing hallucinated emissions numbers?",
            "Our Copilot runs a constrained RAG & LangGraph tool-calling pipeline. It does not guess numbers; it parses user intent and explicitly calls deterministic backend calculation tools (analytics_query, cea_factor_lookup, intensity_service). Citations and step-by-step reasoning traces are embedded directly in the response."
        ),
        (
            "Q8: What is your 5-Pillar Sustainability Score methodology?",
            "We compute a weighted composite score (0-100) aligned with ISO 50001: Energy Efficiency (30%), Emission Intensity (30%), Renewable Energy Share (20%), Anomaly Health SLA (10%), and Data Fidelity/Quality (10%). Facilities scoring >= 80 receive 'Tier A Leader' status."
        ),
        (
            "Q9: How scalable is the backend if we ingest data from 10,000 smart meters per second?",
            "Our FastAPI asynchronous architecture decouples ingestion via Redis/MQTT message brokers with bulk time-series inserts into PostgreSQL/TimescaleDB. Telemetry queries utilize composite indexing on (factory_id, timestamp), maintaining sub-15ms response times."
        ),
        (
            "Q10: What is your monetization and business model for GreenMetriX?",
            "We operate a tiered B2B SaaS model: 1) Starter ($499/mo per plant) for automated CEA reporting and anomaly alerts; 2) Enterprise Pro ($1,499/mo per plant) for Digital Twin, AI Copilot, and sub-metering; 3) Decarbonization CAPEX Marketplace taking 2-4% commission on solar/equipment financing."
        )
    ]

    for q, a in qa_list:
        card_content = [
            Paragraph(f"<b>{q}</b>", q_style),
            Spacer(1, 1.5),
            Paragraph(f"<b>Answer:</b> {a}", a_style)
        ]
        card_table = Table([[card_content]], colWidths=[504])
        card_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('LEFTPADDING', (0,0), (-1,-1), 7),
            ('RIGHTPADDING', (0,0), (-1,-1), 7),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(card_table)
        story.append(Spacer(1, 4))

    # Future Scope & Commercialization Roadmap Section
    story.append(Spacer(1, 6))
    story.append(Paragraph("4. Future Scope & Commercialization Roadmap", h1_style))
    story.append(Paragraph("GreenMetriX has a defined 4-phase technical roadmap to evolve from an analytical SaaS into an autonomous industrial decarbonization OS:", body_style))
    story.append(Spacer(1, 4))

    future_phases = [
        ("Phase 1: Edge IoT & Sub-Second Modbus/BACnet Telemetry", 
         "Deploy lightweight Rust/C++ edge gateway agents directly on industrial PLCs and Modbus RTU/TCP energy meters to stream high-frequency (1 Hz) harmonic distortion, power factor, and phase unbalance telemetry directly to GreenMetriX cloud brokers."),
        
        ("Phase 2: Automated Microgrid & BESS Autonomous Dispatch", 
         "Upgrade the Digital Twin into an active Closed-Loop Control Agent that interfaces directly with Solar Inverters and Battery Energy Storage Systems (BESS) to autonomously charge during surplus solar hours and discharge during peak tariff slots."),
        
        ("Phase 3: Blockchain-Verified Carbon Credits & Smart Contracts", 
         "Integrate decentralized tamper-proof ledger logging (Ethereum / Polygon ERC-3643 compliant) where verified tCO2e reductions automatically mint certified green credits compliant with Article 6 of the Paris Agreement and Verra Gold Standard."),
        
        ("Phase 4: Global CBAM & SEBI BRSR Core Automated Filing", 
         "Extend reporting engines with 1-click XML/XBRL filing modules for the European Union Carbon Border Adjustment Mechanism (CBAM) and Indian SEBI Business Responsibility and Sustainability Reporting (BRSR Core) for tier-1 exporters."),
        
        ("Phase 5: Supply Chain Scope 3 Privacy-Preserving Federated Learning", 
         "Allow automotive and electronics OEMs to aggregate upstream Scope 3 supplier carbon footprints without exposing sensitive supplier manufacturing volumes using differential privacy and federated learning.")
    ]

    for title, desc in future_phases:
        phase_content = [
            Paragraph(f"<b>🚀 {title}</b>", future_title_style),
            Spacer(1, 1.5),
            Paragraph(desc, a_style)
        ]
        phase_table = Table([[phase_content]], colWidths=[504])
        phase_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#86efac')),
            ('LEFTPADDING', (0,0), (-1,-1), 7),
            ('RIGHTPADDING', (0,0), (-1,-1), 7),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(phase_table)
        story.append(Spacer(1, 4))

    # Hackathon Pitch Closing Summary
    story.append(Spacer(1, 6))
    story.append(Paragraph("5. The 30-Second Winning Elevator Pitch", h1_style))
    pitch_text = """<i>\"Judges, Indian manufacturing accounts for over 28% of national emissions, yet factory managers still manage carbon using static annual spreadsheets. GreenMetriX turns passive factory data into an active decarbonization intelligence engine. With 98.9% ML forecast accuracy, zero-hallucination ISO 50001 Copilots, real-time Digital Twin simulation, and a clear path to edge autonomous microgrids, we empower manufacturers to Measure, Predict, and Decarbonize their operations while cutting power costs by up to 34%.\"</i>"""
    story.append(Paragraph(pitch_text, body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    out_path = r"C:\Users\rajni\Downloads\GreenMetriX_Hackathon_Defense_Guide.pdf"
    build_pdf(out_path)
