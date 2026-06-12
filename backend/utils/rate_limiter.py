from fastapi import HTTPException, Request
from utils.redis_client import redis_client

RATE_LIMIT = 20
WINDOW_SECONDS = 60


def check_rate_limit(request: Request):
    client_ip = request.client.host

    key = f"rate:{client_ip}"

    current_count = redis_client.incr(key)

    if current_count == 1:
        redis_client.expire(key, WINDOW_SECONDS)

    if current_count > RATE_LIMIT:
        raise HTTPException(
            status_code=429, detail="Rate limit exceeded. Please try again later."
        )
