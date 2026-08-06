#!/usr/bin/env python3
"""Static file server for the Digby UI prototype. One command, no deps.

All state lives in the browser (data.js) — this just serves files.
"""
import http.server
import socketserver
from pathlib import Path

ROOT = Path(__file__).parent
PORT = 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


def main():
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Digby UI prototype running at http://127.0.0.1:{PORT}")
        print("Variants: ?variant=A (Momentum) / B (Cascade) / C (Conversation)")
        print("Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
