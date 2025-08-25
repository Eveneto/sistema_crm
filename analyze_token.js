// Análise do Token Firebase
const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjkyZTg4M2NjNDY2M2E2MzMyYWRhNmJjMWU0N2YzZmY1ZTRjOGI1ZDciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY3JtLXN5c3RlbS1mZjBlYiIsImF1ZCI6ImNybS1zeXN0ZW0tZmYwZWIiLCJhdXRoX3RpbWUiOjE3NTYxMjg0MzksInVzZXJfaWQiOiIwcGFWTm4zdzF6TXhGaGVyclo2RmN2T0FZdEczIiwic3ViIjoiMHBhVk5uM3cxek14RmhlcnJaNkZjdk9BWXRHMyIsImlhdCI6MTc1NjEyODQzOSwiZXhwIjoxNzU2MTMyMDM5LCJlbWFpbCI6InRlc3RlQGV4ZW1wbG8uY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlQGV4ZW1wbG8uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.dAzqaB_P5_R8DYy3i9vJy_nzttql8AsnUgDsP3SwEH2cUNSrl_1XVWKXErsAuLagMgrUNrtF4mZ7ZB3bOQ8D21e9_R8CzJDA24TQhsHoO2qpwjGNchvFK0GGKMwpR_Sbo_YCxCk1dTaqk3GAVgRsBzKUnKcpPIvnytCU-gIVJvwJyo5_udxd1uGVfpi26RD0LlDHtJexZDKGkyvv_Enz2cihUNqbTiDR5ihRDAsYGnJEOL9gtju2-loWKGkDmEutgi9-C3ZtCZ7psU3236dcrUqX6MMebI3uoxXEUsx9_dz7eda25X591tNBfhJbJROSVNyPkAlPdps3FyF8E3rIxg";

// Decodificar payload do JWT
const parts = token.split('.');
if (parts.length === 3) {
    try {
        const payload = JSON.parse(atob(parts[1]));
        console.log("🔍 ANÁLISE DO TOKEN FIREBASE:");
        console.log("============================");
        console.log("✅ Projeto:", payload.aud);
        console.log("✅ Email:", payload.email);
        console.log("✅ User ID:", payload.user_id);
        console.log("✅ Provedor:", payload.firebase.sign_in_provider);
        console.log("✅ Emitido em:", new Date(payload.iat * 1000).toLocaleString());
        console.log("✅ Expira em:", new Date(payload.exp * 1000).toLocaleString());
        
        const now = Date.now() / 1000;
        const timeLeft = payload.exp - now;
        console.log("⏰ Tempo restante:", Math.floor(timeLeft / 60), "minutos");
        
        console.log("\n🎉 TOKEN VÁLIDO E FUNCIONANDO!");
        
    } catch (e) {
        console.error("❌ Erro ao decodificar token:", e);
    }
} else {
    console.error("❌ Token mal formado");
}
