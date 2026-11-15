"""Servidor estático com threads para testar o export (`web/out`).

Uso:
    python tools/serve_out.py 4300
    python tools/serve_out.py 4301 --base /portifolio   # simula GitHub Pages

Com `--base`, o conteúdo de `web/out` responde em `http://127.0.0.1:4301/portifolio/`
e a raiz redireciona para lá — é como o site aparece em Pages de projeto.
"""
from __future__ import annotations

import functools
import io
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "web" / "out"

BASE = ""
HOST = "0.0.0.0"
PORT = 4300
ARGS = sys.argv[1:]
if ARGS:
    PORT = int(ARGS[0])
if "--base" in ARGS:
    BASE = ARGS[ARGS.index("--base") + 1].rstrip("/")


class Handler(SimpleHTTPRequestHandler):
    # HTTP/1.1 + keep-alive: o Chrome reaproveita as conexões em vez de abrir
    # dezenas por página (no Windows isso derrubava requests com
    # ERR_CONNECTION_REFUSED de vez em quando).
    protocol_version = "HTTP/1.1"

    def translate_path(self, path: str) -> str:
        if BASE and (path == BASE or path.startswith(BASE + "/")):
            path = path[len(BASE) :] or "/"
        return super().translate_path(path)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def handle_one_request(self) -> None:
        # Quando o navegador fecha a aba, o keep-alive pode morrer no meio de uma
        # requisição. Isso é rotina, não erro do servidor: encerra a conexão em
        # silêncio em vez de cuspir traceback.
        try:
            super().handle_one_request()
        except (ConnectionResetError, ConnectionAbortedError):
            self.close_connection = True

    def do_GET(self) -> None:
        # Na raiz, o Pages redireciona para a subpasta do projeto.
        if BASE and self.path in ("/", "/index.html"):
            self.send_response(302)
            self.send_header("Location", BASE + "/")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        super().do_GET()

    def send_head(self):
        """404 igual ao do host: o `404.html` do export, com status 404."""
        try:
            exists = os.path.exists(self.translate_path(self.path))
        except (OSError, ValueError):
            exists = False
        if not exists:
            page = Path(ROOT) / "404.html"
            if page.is_file():
                data = page.read_bytes()
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                return io.BytesIO(data)
        return super().send_head()

    def log_message(self, format: str, *args) -> None:  # noqa: A002
        pass


class Server(ThreadingHTTPServer):
    # O navegador abre ~6 conexões em paralelo por página e, no Windows, conexões
    # para um socket preso a 127.0.0.1 às vezes eram recusadas
    # (ERR_CONNECTION_REFUSED em fontes/chunks). Escutar em todas as interfaces,
    # como o `python -m http.server` faz, elimina o problema.
    request_queue_size = 256
    daemon_threads = True


def main() -> int:
    handler = functools.partial(Handler, directory=str(ROOT))
    server = Server((HOST, PORT), handler)
    print(f"servindo {ROOT} em http://127.0.0.1:{PORT}{BASE or ''}/")
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
