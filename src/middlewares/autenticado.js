const authService = require('../services/auth.service');

async function autenticado(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Token não fornecido ou mal formatado' });
    }

    const token = authHeader.split(' ')[1];
    const usuario = authService.verificarToken(token);
    
    // Injeta o usuário no request
    request.usuario = usuario;
  } catch (error) {
    return reply.status(401).send({ error: 'Token inválido ou expirado' });
  }
}

module.exports = autenticado;
