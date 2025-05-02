// routes/userRoutes.js

// Laddar in miljövariabler från .env-filen
import dotenv from 'dotenv';
dotenv.config(); // ← Viktigt att detta körs tidigt för att kunna läsa JWT_SECRET

// Importerar nödvändiga moduler
import express from 'express'; // Express för att skapa routes
import bcrypt from 'bcryptjs'; // bcryptjs för att hasha lösenord
import jwt from 'jsonwebtoken'; // jsonwebtoken för att skapa JWT-tokens
import userDb from '../models/userModel.js'; // Användarmodell (NeDB)

const router = express.Router(); // Skapar en routerinstans
const JWT_SECRET = process.env.JWT_SECRET; // Läser in JWT-hemlighet från miljövariabel

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

// POST /api/user/signup - Skapa ett nytt konto
router.post('/signup', async (req, res) => {
    // Hämtar användarnamn och lösenord från request body
    const { username, password } = req.body;

    // Kontrollerar att båda fälten finns och att lösenordet är tillräckligt långt
    if (!username || !password || password.length < 5) {
        return res.status(400).json({ error: 'Ogiltiga inloggningsuppgifter' });
    }

    // Kollar om användarnamnet redan finns i databasen
    const existingUser = await userDb.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: 'Användarnamn finns redan' });
    }

    // Hashar lösenordet med bcrypt (10 rundor)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Skapar en ny användare och sparar i databasen
    const newUser = await userDb.insert({ username, password: hashedPassword });

    // Skickar tillbaka bekräftelse om att kontot skapats
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

// POST /api/user/login - Logga in och få en JWT-token
router.post('/login', async (req, res) => {
    // Hämtar användarnamn och lösenord från request body
    const { username, password } = req.body;

    // Försöker hitta användaren i databasen
    const user = await userDb.findOne({ username });

    // Om ingen användare hittas, returnera fel
    if (!user) return res.status(400).json({ error: 'Fel användarnamn eller lösenord' });

    // Jämför det inmatade lösenordet med det hashade lösenordet i databasen
    const valid = await bcrypt.compare(password, user.password);

    // Om lösenordet inte stämmer, returnera fel
    if (!valid) return res.status(400).json({ error: 'Fel användarnamn eller lösenord' });

    // Skapar en JWT-token som innehåller användarens id och namn
    // Token är giltig i 1 timme
    const token = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Skickar tillbaka token till klienten
    res.status(200).json({ token });
});


export default router;
