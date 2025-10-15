#!/usr/bin/env python3
"""
Servidor simples para desenvolvimento do frontend vanilla
"""
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    PORT = 3001
    
    # Mudar para o diretório do frontend vanilla
    frontend_dir = Path(__file__).parent
    os.chdir(frontend_dir)
    
    print(f"🚀 Servidor frontend iniciando na porta {PORT}")
    print(f"📁 Servindo arquivos de: {frontend_dir}")
    print(f"🌐 Acesse: http://localhost:{PORT}")
    print("⏹️  Pressione Ctrl+C para parar")
    
    try:
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"✅ Servidor rodando em http://localhost:{PORT}")
            
            # Abrir automaticamente no navegador
            webbrowser.open(f'http://localhost:{PORT}')
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Porta {PORT} já está em uso. Tente outra porta.")
        else:
            print(f"❌ Erro ao iniciar servidor: {e}")

if __name__ == "__main__":
    main()
