import json
import redis

r = redis.Redis(host="redis-rplace.yzihiy.ng.0001.use1.cache.amazonaws.com", port=6379)

def handler(event, context):

    obj = json.loads(json.dumps(event))['message']
    offset = (obj['y'] * 4000) + (obj['x'] * 4)
    color = obj['color']

    for b in f'{color:04b}':
        r.setbit("board", offset, int(b))
        offset = offset + 1
        
