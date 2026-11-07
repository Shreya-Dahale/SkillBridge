#!/usr/bin/env python3
"""
SkillBridge Prototype Server
Serves the Candidate-Side Interactive Prototype on localhost.
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SkillBridgeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers for prototype demo
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server(port=PORT):
    # Try preferred port, or increment if busy
    for attempt_port in range(port, port + 10):
        try:
            with socketserver.TCPServer(("", attempt_port), SkillBridgeHandler) as httpd:
                print(f"=" * 60)
                print(f"  SkillBridge – AI-Assisted Career Re-Entry Platform")
                print(f"  Candidate Prototype Running on:")
                print(f"  >>> http://localhost:{attempt_port}")
                print(f"=" * 60)
                print(f"  Serving files from: {DIRECTORY}")
                print(f"  Press Ctrl+C to terminate.")
                httpd.serve_forever()
        except OSError as e:
            if attempt_port < port + 9:
                continue
            else:
                print(f"Error starting server: {e}")
                sys.exit(1)

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port_arg)
