#!/usr/bin/env python3
"""
EasyDentalLab — Claude AI Proxy Server
Run this script before using the AI Assistant in EasyDentalLab.
Usage:  python3 claude_server.py
Access: http://localhost:5765
"""

import json
from flask import Flask, request, Response, stream_with_context
import anthropic

app = Flask(__name__)

def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response

@app.after_request
def after_request(response):
    return add_cors(response)

@app.route("/api/chat", methods=["OPTIONS", "POST"])
def chat():
    if request.method == "OPTIONS":
        return Response("", status=200)

    body = request.get_json(force=True)
    api_key = (body.get("apiKey") or "").strip()
    messages = body.get("messages", [])
    system   = body.get("system", "")

    if not api_key:
        return Response(
            json.dumps({"error": "No API key provided. Add your Anthropic API key in Settings → AI Assistant."}),
            status=400, mimetype="application/json"
        )

    client = anthropic.Anthropic(api_key=api_key)

    def generate():
        try:
            with client.messages.stream(
                model="claude-sonnet-4-6",
                max_tokens=2048,
                system=system,
                messages=messages,
            ) as stream:
                for text in stream.text_stream:
                    yield f"data: {json.dumps({'text': text})}\n\n"
            yield "data: [DONE]\n\n"
        except anthropic.AuthenticationError:
            yield f"data: {json.dumps({'error': 'Invalid API key. Check your key in Settings → AI Assistant.'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    resp = Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
    return resp

if __name__ == "__main__":
    print("=" * 55)
    print("  EasyDentalLab — Claude AI Proxy")
    print("  Listening on http://localhost:5765")
    print("  Keep this window open while using the AI Assistant.")
    print("=" * 55)
    app.run(host="localhost", port=5765, debug=False, threaded=True)
