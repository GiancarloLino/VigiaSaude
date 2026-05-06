const db = require('../db');

function autorizado(...rolesPermitidas) {
  return async (request, reply) => {
    const { usuario } = request;

    if (!usuario) {
      return reply.status(401).send({ error: 'Usuário não autenticado' });
    }

    if (rolesPermitidas.length > 0 && !rolesPermitidas.includes(usuario.role)) {
      return reply.status(403).send({ error: 'Acesso negado: perfil não autorizado' });
    }

    // Configura o Row Level Security para as consultas que ocorrerem nesta requisição
    // IMPORTANTE: Em um pool de conexões o SET LOCAL só funciona dentro de uma transação.
    // Como solicitado: "Antes de cada query no banco, execute: SET LOCAL app.current_user_id = '{usuario.id}'"
    try {
      await db.query(`SET LOCAL app.current_user_id = '${usuario.id}'`);
    } catch (error) {
      request.log.error('Erro ao configurar contexto do RLS no banco de dados', error);
      // Fallback para SET SESSION caso a query acima falhe por estar fora de bloco de transação
      // dependendo de como a biblioteca pg gerencia pool connections fora de BEGIN...COMMIT
      await db.query(`SET SESSION app.current_user_id = '${usuario.id}'`);
    }
  };
}

module.exports = autorizado;
