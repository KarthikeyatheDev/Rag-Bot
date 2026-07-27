import os
from functools import lru_cache

import requests
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = "BAAI/bge-reranker-v2-m3"
API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_NAME}"


@lru_cache(maxsize=1)
def get_reranker_headers() -> dict:
    hf_token = os.environ["HF_TOKEN"]  # Raises KeyError if missing
    return {"Authorization": f"Bearer {hf_token}"}


def rerank(query: str, chunks: list[str], top_k: int = 5):
    if not chunks:
        return []

    headers = get_reranker_headers()
    payload = {"inputs": [{"text": query, "text_pair": chunk} for chunk in chunks]}

    response = requests.post(API_URL, headers=headers, json=payload, timeout=30)

    if not response.ok:
        # surface the real reason instead of a bare 400
        raise RuntimeError(f"{response.status_code}: {response.text}")

    result = response.json()

    # result is a list, one entry per input pair — each entry is a list of
    # {"label": ..., "score": ...} dicts (usually just one label for this model)
    scores = [entry[0]["score"] for entry in result]

    scored_chunks = sorted(
        zip(scores, chunks),
        key=lambda x: x[0],
        reverse=True,
    )

    return [chunk for _, chunk in scored_chunks[:top_k]]
