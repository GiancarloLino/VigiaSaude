const authService = require('../services/auth.service');

async function authRoutes(fastify, options) {
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const { email, senha } = request.body;

      if (!email || !senha) {
        return reply.status(400).send({ error: 'Email e senha são obrigatórios' });
      }

      const { token, usuario } = await authService.login(email, senha);
      
      return reply.send({ token, usuario });
    } catch (error) {
      if (error.message === 'Credenciais inválidas' || error.message === 'Usuário inativo') {
        return reply.status(401).send({ error: error.message });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}

module.exports = authRoutes;
