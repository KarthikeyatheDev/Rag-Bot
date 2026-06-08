def chunk_text(text: str, chunk_size: int = 200, overlap: int = 50):
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i : i + chunk_size]
        chunks.append(chunk)
    return chunks
