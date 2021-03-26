#!/usr/bin/env python3
# See https://docs.python.org/3.2/library/socket.html
# for a decscription of python socket and its parameters
import socket
import os
import stat

from threading import Thread
from argparse import ArgumentParser

BUFSIZE = 4096
CRLF = '\r\n'
METHOD_NOT_ALLOWED = 'HTTP/1.1 405  METHOD NOT ALLOWED{}Allow: GET, HEAD, POST {}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)
OK_HEAD = 'HTTP/1.1 200 OK{}{}{}'.format(CRLF, CRLF, CRLF) # head request only
OK = 'HTTP/1.1 200 OK\r\nContent-Length: {}\r\nContent-Type: {}; charset=utf-8\r\n\r\n' # format to length, type, body text
NOT_FOUND = 'HTTP/1.1 404 NOT FOUND{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
FORBIDDEN = 'HTTP/1.1 403 FORBIDDEN{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
TEMP_REDIRECT = 'HTTP/1.1 307 TEMPORARY REDIRECT\r\nConnection: close\r\nLocation: {}\r\n\r\n'

# check file permissions -is file world readable?
def check_perms(resource):
  """Returns True if resource has read permissions set on 'others'"""
  stmode = os.stat(resource).st_mode
  return (getattr(stat, 'S_IROTH') & stmode) > 0

def extensionToMIME(extension):
  if extension == '.html':
    content_type = 'text/html'
  elif extension == '.png':
    content_type = 'image/png'
  elif extension == '.jpg':
    content_type = 'image/jpg'
  elif extension == '.mp3':
    content_type = 'audio/mpeg'
  elif extension == '.css':
    content_type = 'text/css'
  elif extension == '.js':
    content_type = 'application/javascript'
  elif extension == '.ico':
    content_type = 'image/x-icon'
  else:
    content_type = None
  return content_type

class HttpServer:
  def __init__(self, host, port):
    print("Server")
    print('listening on port {}'.format(port))
    self.host = host
    self.port = port

    self.setup_socket()

    self.accept()

    self.sock.shutdown()
    self.sock.close()

  def setup_socket(self):
    self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    self.sock.bind((self.host, self.port))
    self.sock.listen(128)

  def accept(self):
    while True:
      (client, address) = self.sock.accept()
      th = Thread(target=self.accept_request, args=(client, address))
      th.start()

  def accept_request(self, client_sock, client_addr):
    print("accept request")
    data = client_sock.recv(BUFSIZE)
    req = data.decode('utf-8') #returns a string
    response, body = self.process_request(req) #returns a string
    #once we get a response, we chop it into utf encoded bytes
    print('######\nRESPONSE:\n{}######'.format(response))
    client_sock.send(bytes(response,'utf-8'))
    if body:
      client_sock.send(body) #will already be in bytes
    #clean up the connection to the client#but leave the server socket for recieving requests open
    client_sock.shutdown(1)
    client_sock.close()

  def process_request(self, request):
    print('######\nREQUEST:\n{}######'.format(request))
    linelist = request.strip().split(CRLF)
    reqline = linelist[0]
    rlwords = reqline.split()
    if len(rlwords) == 0:
      return ''

    resource = rlwords[1][1:] # skip beginning /
    if rlwords[0] == 'HEAD':  
      return self.head_request(resource)
    elif rlwords[0] == 'GET':
      return self.get_request(resource)
    elif rlwords[0] == 'POST':
      # There will be a request body too, so grab that
      bodyLine = linelist[-1]
      return self.post_request(resource, bodyLine)
    else:
      return METHOD_NOT_ALLOWED, b"Methods other than GET, HEAD, POST not allowed.\r\n"

  def head_request(self, resource):
    """Handles HEAD requests."""
    path = os.path.join('.', resource) #look in directory where server is running
    if not os.path.exists(path):
      ret = NOT_FOUND
    elif not check_perms(resource):
      ret = FORBIDDEN
    else:
      ret = OK_HEAD
    return ret, None

  def get_request(self, resource):
    """Handles GET requests,"""
    path = os.path.join('.', resource) #look in directory where server is running
    if 'redirect' in resource:
      # Need to grab the url args
      args = resource.replace('=', '?').split('?')[2]
      return TEMP_REDIRECT.format('https://www.youtube.com/results?search_query=' + args), None
    elif not os.path.exists(resource):
      with open('./404.html', 'rb') as f:
        body = f.read()
      return NOT_FOUND, body
    elif not check_perms(resource):
      with open('./403.html', 'rb') as f:
        body = f.read()
      return FORBIDDEN, body

    else:
      extension = os.path.splitext(path)[1]
      content_type = extensionToMIME(extension)

    # Read raw bytes of resource, will work for both images and text
    with open(path, 'rb') as f:
      body = f.read()

    # format to length, type, also return body bytes
    return OK.format(os.path.getsize(path), content_type), body


  def post_request(self, resource, body):
    """Handles POST requests."""
    # Parse and display the body
    req = list(body.strip().replace('=', '&').split('&'))

    body = """
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <title>POST Echo</title>
      <meta charset="UTF-8">
    </head>

    <body>
      <h1>Form Data Submitted Successfully!</h1>
      <table>
        <tr>
          <td>{}</td>
          <td>{}</td>
        </tr>
        <tr>
          <td>{}</td>
          <td>{}</td>
        </tr>
        <tr>
          <td>{}</td>
          <td>{}</td>
        </tr>
        <tr>
          <td>{}</td>
          <td>{}</td>
        </tr>
        <tr>
          <td>{}</td>
          <td>{}</td>
        </tr>
        <tr>
          <td>{}</td>
          <td>{}</td>
        </tr>
      </table>
    </body>
    </html>
    """.format(*req)

    return OK.format(len(body), 'text/html'), bytes(body, encoding='utf-8')

def parse_args():
  parser = ArgumentParser()
  parser.add_argument('--host', type=str, default='localhost',
                      help='specify a host to operate on (default: localhost)')
  parser.add_argument('-p', '--port', type=int, default=9001,
                      help='specify a port to operate on (default: 900)')
  args = parser.parse_args()
  return (args.host, args.port)


if __name__ == '__main__':
  (host, port) = parse_args()
  HttpServer(host, port)

