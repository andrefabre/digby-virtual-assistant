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

    def end_headers(self):
        # This file set changes on every edit during prototyping — never let
        # the browser cache a stale copy of it (that's what caused variant A
        # to keep rendering as the retired "Momentum" design after a rebuild).
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


def main():
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Digby UI prototype running at http://127.0.0.1:{PORT}")
        print("Variants: ?variant=A (Command Center) / B (Cascade) / C (Timeline)")
        print("Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
