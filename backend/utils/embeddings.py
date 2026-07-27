import os
from functools import lru_cache

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

HF_TOKEN = os.environ["HF_TOKEN"]

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_embedding_client():
    return InferenceClient(
        provider="hf-inference",
        api_key=HF_TOKEN,
    )


def generate_embedding(text: str) -> list[float]:
    client = get_embedding_client()

    embedding = client.feature_extraction(
        text,
        model=MODEL_NAME,
    )

    return [float(x) for x in embedding]
