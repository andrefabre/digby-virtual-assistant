#!/usr/bin/env python3
"""Local prototype server for the Digby web UI exploration.

Stdlib-only on purpose: no pip install required to try it out.
Not the MVP delivery artifact (that's CLI/markdown per issue #17) —
this is a throwaway UI sketch against the current domain model.
"""
import json
import http.server
import socketserver
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).parent
DATA_FILE = ROOT / "data.json"
PORT = 8765


def load_data():
    with DATA_FILE.open(encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/state":
            self._send_json(load_data())
            return
        if path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/checkin":
            self._send_json({"error": "not found"}, status=404)
            return

        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self._send_json({"error": "invalid JSON"}, status=400)
            return

        updates = body.get("updates", [])
        today = date.today().isoformat()

        data = load_data()

        already_checked_in_today = any(
            c["date"] == today for c in data["checkins"]
        )
        if already_checked_in_today:
            self._send_json(
                {"error": "Already checked in today — one check-in per day."},
                status=409,
            )
            return

        valid_reason_codes = set(data["reason_codes"])
        commitments_by_id = {c["id"]: c for c in data["weekly_plan"]["commitments"]}

        for update in updates:
            commitment = commitments_by_id.get(update.get("commitment_id"))
            if commitment is None:
                continue
            status = update.get("status")
            if status not in ("done", "missed"):
                continue
            if status == "missed" and update.get("reason_code") not in valid_reason_codes:
                self._send_json(
                    {"error": f"Missed commitment {commitment['id']} needs a reason code."},
                    status=400,
                )
                return
            commitment["status"] = status
            commitment["reason_code"] = update.get("reason_code") if status == "missed" else None

        data["checkins"].append({
            "date": today,
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "updates": updates,
        })

        save_data(data)
        self._send_json(data)


def main():
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Digby web prototype running at http://127.0.0.1:{PORT}")
        print("Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
