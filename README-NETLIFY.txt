BAKONGUINHO — VERSÃO PRONTA PARA NETLIFY

1. PUBLIQUE O SITE PÚBLICO
- Faça upload desta pasta na Netlify.
- O ficheiro index.html está na raiz.
- A configuração netlify.toml já está incluída.
- O site público funciona sem Node.js, PHP ou XAMPP.
- Se a API Node não estiver disponível, o site usa os dados de demonstração incorporados e continua a apresentar o menu.

2. ADMINISTRADOR
A versão original usa Node.js + Express + SQLite. A Netlify, por si só, não mantém este servidor Node tradicional nem uma base SQLite persistente.
Por isso, o backend original foi preservado em backend-node/.
Para ter um painel administrativo online com gravação real, é necessário publicar esse backend num serviço Node compatível e usar uma base de dados persistente (ou adaptar a API para uma base cloud).

3. TESTE LOCAL DO BACKEND
Entre em backend-node e execute:
  npm install
  npm start
Depois abra http://localhost:3000

Login inicial:
  admin@bakonguinho.ao
  123456

4. NOTA
Nunca use a palavra-passe inicial em produção. Defina também SESSION_SECRET forte no servidor Node.
