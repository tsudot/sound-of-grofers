import socketio
import eventlet
import eventlet.wsgi
from flask import Flask, render_template
import json
import time

sio = socketio.Server()
app = Flask(__name__)

bombs = [
        {
            'name': 'Butter',
            'country': 'India',
            'yield': 1600,
            'radius': 15,
            'fillKey': 'Mumbai',
            'latitude': 28.4595,
            'longitude': 77.0266,
            'user': 'tsudot',
            },
        {
            'name': 'Rice',
            'country': 'India',
            'yield': 1600,
            'radius': 15,
            'fillKey': 'Gurgaon',
            'latitude': 19.0760,
            'longitude': 72.8777,
            'user': 'tsudot',
            }
        ];


@sio.on('connect')
def connect(sid, environ):
    print("connect ", sid)
    sio.emit('search_event', json.dumps(bombs))
    time.sleep(2);
    sio.emit('search_event', json.dumps(bombs[0]))
    time.sleep(2);
    sio.emit('search_event', json.dumps(bombs[1]))
    print("message sent")

@sio.on('search_event')
def message(sid, data):
    print("message ", data)
    sio.emit('reply')

@sio.on('disconnect')
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    # wrap Flask application with engineio's middleware
    app = socketio.Middleware(sio, app)

    # deploy as an eventlet WSGI server
    eventlet.wsgi.server(eventlet.listen(('', 8086)), app)
