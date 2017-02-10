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
        try:
            clients.remove(self)
            print self.address, 'closed'
        except:
            pass
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


def callback():
    r = redis.Redis(connection_pool=hb_redis_pool)
    sub = r.pubsub()
    sub.subscribe('order_events')
    while True:
        for m in sub.listen():
            #print m
            if m:
                time.sleep(1)
                try:
                    event = json.loads(m['data'])
                except:
                    continue
                event_name = event['_meta']['event_name']
                print 'Received event: {}'.format(event_name)
                print 'Connected clients: {}'.format(
                    [c.address for c in clients])
                fill_key = 'receive_order'
                if event_name != 'receive_order':
                    continue
                order = event['order']
                if order['first_time_user']:
                    fill_key = 'other'
                try:
                    cord = order['delivery_address']['coordinates']
                    name = order['delivery_address']['name']
                    print 'got cords: {} from event: {}'.format(cord, event_name)
                    lat = cord['lat']
                    lon = cord['lon']
                    city = order['delivery_address']['city']
                    msg = {'data': [
                        {
                            'fillKey': fill_key,
                            'latitude': lat,
                            'longitude': lon,
                            'customer_name': name,
                            'radius': 7,
                            'city': city,
                            'total_cost': order['total_cost'],
                        },
                    ],
                        'event': event_name
                    }
                    for client in clients:
                        print 'sending payload: {} to client {}'.format(
                            msg, client.address[0])
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

