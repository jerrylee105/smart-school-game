#!/usr/bin/env python3
"""
Server tĩnh + endpoint TTS sử dụng lệnh 'say' của macOS.
Thay thế python3 -m http.server để vừa phục vụ file tĩnh vừa cung cấp TTS.
"""

import http.server
import subprocess
import tempfile
import os
import urllib.parse
import json

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class TTSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == '/tts':
            self.handle_tts(parsed)
        elif parsed.path == '/tts/voices':
            self.handle_voices()
        else:
            super().do_GET()

    def handle_tts(self, parsed):
        """Tạo audio từ text bằng lệnh 'say' macOS, trả về file WAV."""
        params = urllib.parse.parse_qs(parsed.query)
        text = params.get('text', [''])[0]
        voice = params.get('voice', ['Samantha'])[0]
        rate = params.get('rate', ['175'])[0]  # words per minute

        if not text:
            self.send_error(400, 'Missing "text" parameter')
            return

        try:
            # Tạo file tạm
            with tempfile.NamedTemporaryFile(suffix='.aiff', delete=False) as aiff_f:
                aiff_path = aiff_f.name
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as wav_f:
                wav_path = wav_f.name

            # Bước 1: say -> AIFF
            subprocess.run(
                ['say', '-v', voice, '-r', str(rate), '-o', aiff_path, text],
                check=True, timeout=10
            )

            # Bước 2: AIFF -> WAV (định dạng trình duyệt hỗ trợ tốt nhất)
            subprocess.run(
                ['afconvert', '-f', 'WAVE', '-d', 'LEI16', aiff_path, wav_path],
                check=True, timeout=10
            )

            # Đọc file WAV và trả về
            with open(wav_path, 'rb') as f:
                wav_data = f.read()

            self.send_response(200)
            self.send_header('Content-Type', 'audio/wav')
            self.send_header('Content-Length', str(len(wav_data)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(wav_data)

        except subprocess.TimeoutExpired:
            self.send_error(504, 'TTS timeout')
        except subprocess.CalledProcessError as e:
            self.send_error(500, f'TTS error: {e}')
        except Exception as e:
            self.send_error(500, f'Server error: {e}')
        finally:
            # Dọn file tạm
            for p in [aiff_path, wav_path]:
                try:
                    os.unlink(p)
                except:
                    pass

    def handle_voices(self):
        """Liệt kê các giọng đọc có sẵn trên macOS."""
        try:
            result = subprocess.run(
                ['say', '-v', '?'],
                capture_output=True, text=True, timeout=5
            )
            voices = []
            for line in result.stdout.strip().split('\n'):
                parts = line.split()
                if parts:
                    voices.append(parts[0])

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(voices).encode())
        except Exception as e:
            self.send_error(500, f'Error: {e}')

    def log_message(self, format, *args):
        # Chỉ log request TTS, bỏ qua static files để console sạch
        if '/tts' in str(args):
            super().log_message(format, *args)


if __name__ == '__main__':
    with http.server.HTTPServer(('', PORT), TTSHandler) as httpd:
        print(f'🎙️  TTS Server đang chạy tại http://localhost:{PORT}')
        print(f'📁 Thư mục gốc: {DIRECTORY}')
        print(f'🔊 Endpoint TTS: http://localhost:{PORT}/tts?text=hello&voice=Samantha')
        print(f'📋 Danh sách giọng: http://localhost:{PORT}/tts/voices')
        httpd.serve_forever()
