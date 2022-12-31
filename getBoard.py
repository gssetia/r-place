import redis

r = redis.Redis(host="redis-rplace.yzihiy.ng.0001.use1.cache.amazonaws.com", port=6379)

def handler(event, context):
    return r.get("board")
