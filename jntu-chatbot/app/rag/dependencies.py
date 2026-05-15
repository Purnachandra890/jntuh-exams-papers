from functools import lru_cache
from app.config import settings
from app.rag.ingestion import load_exam_papers, paper_to_metadata, paper_to_text

@lru_cache(maxsize=1)
def get_paper_index():
    papers = load_exam_papers(settings.DATA_FILE)
    return [
        {
            "id": metadata["_id"] if metadata["_id"] else f"paper_{index}",
            "document": paper_to_text(paper),
            "metadata": metadata,
        }
        for index, paper in enumerate(papers)
        for metadata in [paper_to_metadata(paper)]
    ]
