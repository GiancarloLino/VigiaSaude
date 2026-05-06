const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');

class AuthService {
  async login(email, senha) {
    const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = rows[0];

    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new Error('Usuário inativo');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.role,
      unidade_id: usuario.unidade_id,
      ativo: usuario.ativo
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return { token, usuario: payload };
  }

  verificarToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }
}

module.exports = new AuthService();
