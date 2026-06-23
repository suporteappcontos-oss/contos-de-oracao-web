const fs = require('fs');
let c = fs.readFileSync('d:/Projeto/web/src/app/admin/actions.ts', 'utf8');

c = c.replace(/const title = '✨ Novo Vídeo Disponível!';/g, "const title = 'Novo Vídeo Disponível!';");
c = c.replace(/const title = '📚 Novo Material Adicionado!';/g, "const title = 'Novo Material Adicionado!';");

c = c.replace(/await supabase\.from\('notificacoes'\)\.insert/g, "await getAdminClient().from('notificacoes').insert");

fs.writeFileSync('d:/Projeto/web/src/app/admin/actions.ts', c, 'utf8');
console.log('actions.ts fixed successfully.');
