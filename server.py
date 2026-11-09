import http.server
import socketserver
import os

PORT = int(os.environ.get("PORT", 3030))

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def translate_path(self, path):
        # Let base class resolve the path against working directory
        fs_path = super().translate_path(path)
        # If path doesn't exist but path.html exists, return path.html
        if not os.path.exists(fs_path) and os.path.exists(fs_path + '.html'):
            return fs_path + '.html'
        return fs_path

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CleanURLHandler) as httpd:
        print(f"Capture dev server running at http://localhost:{PORT}")
        httpd.serve_forever()
