from app.rag.dependencies import get_embedding_model, get_chroma_collection

def retrieve_papers(query: str, top_k: int = 5):
    collection = get_chroma_collection()
    if collection is None:
        return []

    model = get_embedding_model()
    query_embedding = model.encode([query]).tolist()[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )

    output = []
    if not results or not results.get("ids") or not results["ids"][0]:
        return output

    for rank, (doc_id, document, metadata, distance) in enumerate(zip(
        results["ids"][0],
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ), start=1):
        output.append({
            "id": doc_id,
            "subject": metadata.get("subject"),
            "branch": metadata.get("branch"),
            "semester": metadata.get("semester"),
            "examType": metadata.get("examType"),
            "status": metadata.get("status"),
            "fileUrl": metadata.get("fileUrl"),
            "distance": distance,
            "document": document,
        })

    return output
