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


def callback():
    r = redis.client.StrictRedis()
    sub = r.pubsub()
    sub.subscribe('orders')
    while True:
        for m in sub.listen():
            print 'Recieved: {0}'.format(m['data'])
            print clients
            for client in clients:
                client.sendMessage(address + u'' + m['data'])

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

