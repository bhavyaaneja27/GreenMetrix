import re
from pathlib import Path
from typing import List, Dict, Any

DOCS_DIR = Path(__file__).resolve().parents[3] / "rag" / "documents"

class RAGRetriever:
    def __init__(self):
        self.documents = []
        self._load_documents()

    def _load_documents(self):
        if not DOCS_DIR.exists():
            return
        for doc_file in DOCS_DIR.glob("*.md"):
            try:
                text = doc_file.read_text(encoding="utf-8")
                # Split by headers (##)
                chunks = re.split(r"\n(?=## )", text)
                for c in chunks:
                    title = doc_file.stem.replace("_", " ").title()
                    lines = c.strip().split("\n")
                    header = lines[0].replace("#", "").strip() if lines else title
                    content = "\n".join(lines[1:]).strip() if len(lines) > 1 else c
                    self.documents.append({
                        "doc_title": title,
                        "section": header,
                        "content": content,
                        "source": doc_file.name
                    })
            except Exception as e:
                print(f"Error loading {doc_file}: {e}")

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.documents:
            self._load_documents()

        q_terms = set(re.findall(r"\w+", query.lower()))
        results = []

        for doc in self.documents:
            text = (doc["doc_title"] + " " + doc["section"] + " " + doc["content"]).lower()
            doc_terms = set(re.findall(r"\w+", text))
            score = len(q_terms.intersection(doc_terms)) / max(1, len(q_terms))
            if score > 0:
                results.append((score, doc))

        results.sort(key=lambda x: x[0], reverse=True)
        top = [
            {
                "title": f"{r[1]['doc_title']} - {r[1]['section']}",
                "snippet": r[1]["content"][:300] + "...",
                "source": r[1]["source"],
                "relevance_score": round(r[0], 2)
            }
            for r in results[:top_k]
        ]
        return top

retriever = RAGRetriever()
