# 🚀 INSTRUÇÕES PARA CORRIGIR WEBSOCKET

## ✅ PROBLEMA RESOLVIDO: Erro 403

O erro 403 foi corrigido! Agora o usuário admin tem acesso a todas as salas.

## 🔧 PARA CORRIGIR O WEBSOCKET:

### **PROBLEMA:**
O Django `runserver` não suporta WebSocket nativamente. Precisa usar ASGI server.

### **SOLUÇÃO:**

**1. Parar o backend atual** (Ctrl+C no terminal do runserver)

**2. Reiniciar com Daphne (suporte WebSocket):**
```bash
# No terminal do backend:
cd /home/dev_pc/Documentos/crm_freela/backend
source ../.venv/bin/activate
daphne -p 8000 crm_backend.asgi:application
```

**3. OU usar Uvicorn (alternativa):**
```bash
# Se preferir uvicorn:
pip install uvicorn
uvicorn crm_backend.asgi:application --host 0.0.0.0 --port 8000 --reload
```

## 🎯 APÓS REINICIAR O BACKEND:

1. ✅ **Recarregue o chat**: http://localhost:3000/chat
2. ✅ **Clique em qualquer sala** - não deve mais dar erro 403
3. ✅ **O ícone deve ficar verde** 🟢 (conectado)
4. ✅ **Digite uma mensagem** e teste o envio
5. ✅ **Abra em 2 abas** e teste mensagens em tempo real

## 🔍 DIAGNÓSTICO:

**Se ainda der erro WebSocket:**
- Verifique se o daphne iniciou sem erros
- URL WebSocket: `ws://localhost:8000/ws/chat/{roomId}/`
- Console do navegador deve mostrar conexão WebSocket

**Se der erro 403:**
- Significa que as permissões ainda não foram aplicadas
- Execute novamente o script de permissões que rodamos

## 🎉 RESULTADO ESPERADO:

- ✅ Lista de salas funcionando
- ✅ Acesso a todas as salas
- ✅ WebSocket conectado (ícone verde)
- ✅ Mensagens em tempo real
- ✅ Chat completamente funcional!

**Reinicie o backend com daphne e teste!** 🚀
