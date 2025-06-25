const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Banco de dados em memória
const users = [];

// Cadastro
app.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'E-mail já cadastrado.' });
  }
  users.push({ id: crypto.randomUUID(), name, email, password });
  return res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
});

// Login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  }
  return res.json({ message: 'Login realizado com sucesso.', user: { id: user.id, name: user.name, email: user.email } });
});

// Recuperação de senha (simulado)
app.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  // Simula envio de e-mail
  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório.' });
  }
  // Sempre responde sucesso para não expor usuários
  return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções em instantes.' });
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
}); 