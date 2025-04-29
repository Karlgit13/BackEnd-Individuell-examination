// routes/userRoutes.js

import dotenv from 'dotenv';
dotenv.config(); // ← Lägg till detta först!


import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userDb from '../models/userModel.js';

console.log("JWT_SECRET i userRoutes:", process.env.JWT_SECRET);


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     summary: Skapa ett nytt konto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Konto skapat
 *       400:
 *         description: Ogiltiga inloggningsuppgifter
 */

// POST /api/user/signup
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password || password.length < 5) {
        return res.status(400).json({ error: 'Ogiltiga inloggningsuppgifter' });
    }

    const existingUser = await userDb.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: 'Användarnamn finns redan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userDb.insert({ username, password: hashedPassword });

    res.status(200).json({ message: 'Konto skapat' });
});


/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Logga in en användare och få en JWT-token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inloggning lyckades, JWT-token returneras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Fel användarnamn eller lösenord
 */

// POST /api/user/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await userDb.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Fel användarnamn eller lösenord' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Fel användarnamn eller lösenord' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
        expiresIn: '1h'
    });

    res.status(200).json({ token });
});

export default router;
