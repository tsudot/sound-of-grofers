import threading
import time
import json

import redis
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket


clients = []
address = ''

class GrofersEvent(WebSocket):

    def handleMessage(self):
        for client in clients:
            if client != self:
                client.sendMessage(self.address[0] + u' - ' + self.data)

    def handleConnected(self):
        print self.address, 'connected'
        for client in clients:
            client.sendMessage(self.address[0] + u' - connected')
        clients.append(self)
        address = self.address[0]

    def handleClose(self):
        clients.remove(self)
        print self.address, 'closed'
        # for client in clients:
        #     client.sendMessage(self.address[0] + u' - disconnected')

REDIS_HOST = 'mandalore.6zvekq.ng.0001.apse1.cache.amazonaws.com'
#REDIS_HOST = '127.0.0.1'
REDIS_PORT = 6379
REDIS_DB = 0
REDIS_PASSWORD = ''

hb_redis_pool = redis.ConnectionPool(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB)

import time

def callback():
    r = redis.Redis(connection_pool=hb_redis_pool)
    sub = r.pubsub()
    sub.subscribe('orders')
    while True:
        for m in sub.listen():
            #print m
            if m:
                try:
                    event = json.loads(m['data'])
                except:
                    continue
                event_name = event['_meta']['event_name']
                print 'Received event: {}'.format(event_name)
                fill_key = 'receive_order'
                if event_name != 'receive_order':
                    fill_key = 'other'
                order = event['order']
                try:
                    cord = order['delivery_address']['coordinates']
                    print 'got cords: {} from event: {}'.format(cord, event_name)
                    lat = cord['lat']
                    lon = cord['lon']
                    msg = {'data': [
                        {
                            'fillKey': fill_key,
                            'latitude': lat,
                            'longitude': lon,
                            'customer_name': 'gsin',
                            'radius': 15,
                            'user': 'tsudot',
                            'yield': 400
                        }
                    ],
                        'event': fill_key
                    }
                    for client in clients:
                        print 'sending payload: {} to client {}'.format(
                            msg, client)
                        client.sendMessage(address + u'' + json.dumps(msg))
                except Exception as e:
                    print 'no cords found in {}, skipping'.format(event_name)
                    continue
            #for client in clients:
            #    client.sendMessage(address + u'' + m['data'])

def main():
    while True:
        print 'Waiting'
        time.sleep(30)

if __name__ == '__main__':
    t = threading.Thread(target=callback)
    t.setDaemon(True)
    t.start()

    server = SimpleWebSocketServer('', 8086, GrofersEvent)
    server.serveforever()

