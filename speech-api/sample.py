import argparse
import websocket
import threading
import time
import requests
import json
import datetime


URL_ROOT = 'chat.wintonhackathon.com'
PROTO = 'http://'
WS_PROTO = 'ws://'

def deserialise_msg(str):
  return json.loads(str)

def serialise_msg(user, message):
  msg_obj = {'user': user, 'message': message}
  return json.dumps(msg_obj)

def print_message(msg):
  dt_int = msg['dateTime']
  user = msg['user']
  msgBody = msg['message']
  dt = datetime.datetime.fromtimestamp(dt_int / 1000)
  print('[{}] {}  -  {}'.format(dt.strftime("%Y-%m-%d %H:%M:%S"), user, msgBody))


class ChatRoom:
  def __init__(self, room, username):
    self.room = room
    self.username = username

  def get_recent_messages(self):
    url = '{}{}/rooms/{}'.format(PROTO, URL_ROOT, self.room)
    msgs = requests.get(url)
    return deserialise_msg(msgs.text)

  def poll_room(self):
    def on_message(ws, message):
      print_message(deserialise_msg(message))

    def on_error(ws, error):
      print(error)

    def on_close(ws):
      print('### WebSocket closed ###')

    def send_some_messages_async(ws):
      def run(*args):
        for i in range(3):
          time.sleep(1)
          ws.send(serialise_msg(self.username, 'Message {}'.format(i)))
        time.sleep(1)
        ws.close()
      listen_thread = threading.Thread(target=run, daemon=False)
      listen_thread.start()

    url = '{}{}/rooms/{}/ws'.format(WS_PROTO, URL_ROOT, self.room)
    ws = websocket.WebSocketApp(url, on_message = on_message,
                                on_error = on_error, on_close = on_close)
    ws.on_open = send_some_messages_async
    ws.run_forever()


if __name__ == "__main__":
  parser = argparse.ArgumentParser(description='Connect to a chat room.')
  parser.add_argument('--user', required=True, help='Your name')
  parser.add_argument('--room', required=True, help='Name of room to connect to')
  args = parser.parse_args()

  chat_room = ChatRoom(args.room, args.user)

  recentMsgs = chat_room.get_recent_messages()
  for m in recentMsgs:
    print_message(m)

  chat_room.poll_room()
