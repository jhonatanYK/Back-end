const express = require('express');
const { default: axios } = require('axios');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { AuthMiddleware } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Rota de registro de usuário
router.post('/api/register', async (req, res) => {
    try {
        const { name, email } = req.body;
        const password = bcrypt.hashSync(req.body.password, 10);

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        const user = await User.create({ name, email, password });

        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'senha secreta ',
            { expiresIn: '1h' }
        );

        // Remover senha do objeto do usuário antes de enviar na resposta
        const userWithoutPassword = { ...user.get() };
        delete userWithoutPassword.password;

        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para obter todos os usuários
router.get('/api/dashboard', AuthMiddleware, async (req, res) => {
    try {
        // Buscar usuários diretamente do banco de dados
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Excluir senhas da resposta
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota de login com JWT
router.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'ninguem-sabe',
            { expiresIn: '1h' }
        );

        // Remover senha do objeto do usuário antes de enviar na resposta
        const userWithoutPassword = { ...user.get() };
        delete userWithoutPassword.password;

        // Enviar token e dados do usuário como resposta
        res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Rota para verificar o token JWT
router.get('/verify-token', AuthMiddleware, (req, res) => {
    // Se chegou até aqui, o token é válido (AuthMiddleware já verificou)
    res.status(200).json({
        valid: true,
        user: req.user // Dados do usuário extraídos do token pelo middleware
    });
});

module.exports = router;