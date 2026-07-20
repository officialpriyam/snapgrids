import os
import uuid
import json
import time
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from modules.texture import generate_texture
from modules.model import generate_model
from modules.schematic import generate_schematic

app = Flask(__name__)
CORS(app)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.before_request
def inject_api_key():
    api_key = request.headers.get('X-Api-Key', '')
    if api_key:
        os.environ['OPENROUTER_API_KEY'] = api_key


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'velix-generator'})


@app.route('/generate/texture', methods=['POST'])
def gen_texture():
    data = request.json
    prompt = data.get('prompt', '')
    resolution = data.get('resolution', 32)
    tex_type = data.get('type', 'item')
    if not prompt:
        return jsonify({'error': 'prompt required'}), 400
    try:
        result = generate_texture(prompt, resolution, tex_type, OUTPUT_DIR)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/generate/model', methods=['POST'])
def gen_model():
    data = request.json
    prompt = data.get('prompt', '')
    texture_ref = data.get('texture_ref', '')
    if not prompt:
        return jsonify({'error': 'prompt required'}), 400
    try:
        result = generate_model(prompt, texture_ref, OUTPUT_DIR)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/generate/schematic', methods=['POST'])
def gen_schematic():
    data = request.json
    prompt = data.get('prompt', '')
    size = data.get('size', 48)
    mode = data.get('mode', 'fast')
    if not prompt:
        return jsonify({'error': 'prompt required'}), 400
    try:
        result = generate_schematic(prompt, size, mode, OUTPUT_DIR)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download/<path:filename>')
def download(filename):
    return send_from_directory(OUTPUT_DIR, filename, as_attachment=True)


@app.route('/preview/<path:filename>')
def preview(filename):
    return send_from_directory(OUTPUT_DIR, filename)


if __name__ == '__main__':
    port = int(os.environ.get('GENERATOR_PORT', 5000))
    print(f'[Velix Generator] Starting on port {port}')
    app.run(host='0.0.0.0', port=port, debug=False)
