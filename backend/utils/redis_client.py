import redis
import json

redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)


def get_cache(key: str):
    data = redis_client.get(key)
    if data:
        return json.loads(data)
    return None


def set_cache(key: str, value, ttl=3600):
    redis_client.setex(key, ttl, json.dumps(value))
