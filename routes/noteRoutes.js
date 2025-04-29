// routes/noteRoutes.js
import express from 'express';
import noteDb from '../models/noteModel.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Hämta alla anteckningar för inloggad användare
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista av anteckningar
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       401:
 *         description: Ej auktoriserad
 */

// GET /api/notes - Hämta alla anteckningar för inloggad användare
router.get('/', authenticate, async (req, res) => {
    try {
        // Hämtar alla anteckningar som tillhör den inloggade användaren (req.user.id kommer från token)
        const notes = await noteDb.find({ userId: req.user.id });
        // Skickar tillbaka anteckningarna med status 200 OK
        res.status(200).json(notes);
    } catch (error) {
        // Om något går fel returneras 500 Server error
        res.status(500).json({ error: 'Kunde inte hämta anteckningar' });
    }
});

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Skapa en ny anteckning
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, text]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 50
 *               text:
 *                 type: string
 *                 maxLength: 300
 *     responses:
 *       200:
 *         description: Anteckning skapad
 *       400:
 *         description: Ogiltig data
 *       401:
 *         description: Ej auktoriserad
 */

// POST /api/notes - Skapa en ny anteckning
router.post('/', authenticate, async (req, res) => {
    // Plockar ut title och text från request body
    const { title, text } = req.body;

    // Validerar att title och text finns och inte överskrider maxlängder
    if (!title || title.length > 50 || !text || text.length > 300) {
        return res.status(400).json({ error: 'Ogiltig anteckning' });
    }

    try {
        // Skapar en ny anteckning
        const newNote = {
            title,
            text,
            createdAt: new Date(),
            modifiedAt: new Date(),
            userId: req.user.id, // Kopplar anteckningen till den inloggade användaren
        };
        // Sparar anteckningen i databasen
        const savedNote = await noteDb.insert(newNote);
        // Returnerar den sparade anteckningen
        res.status(200).json(savedNote);
    } catch (error) {
        res.status(500).json({ error: 'Kunde inte spara anteckning' });
    }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Uppdatera en anteckning
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID för anteckningen som ska uppdateras
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, text]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 50
 *               text:
 *                 type: string
 *                 maxLength: 300
 *     responses:
 *       200:
 *         description: Anteckning uppdaterad
 *       400:
 *         description: Ogiltig data
 *       404:
 *         description: Anteckning hittades inte
 *       401:
 *         description: Ej auktoriserad
 */

// PUT /api/notes/:id - Uppdatera en anteckning
router.put('/:id', authenticate, async (req, res) => {
    // Plockar ut title och text från request body
    const { title, text } = req.body;
    // Plockar ut anteckningens id från URL-parametrarna
    const { id } = req.params;

    // Validerar att title och text är korrekta
    if (!title || title.length > 50 || !text || text.length > 300) {
        return res.status(400).json({ error: 'Ogiltig anteckning' });
    }

    try {
        // Letar upp anteckningen som ska uppdateras och som tillhör rätt användare
        const note = await noteDb.findOne({ _id: id, userId: req.user.id });
        if (!note) return res.status(404).json({ error: 'Anteckning ej funnen' });

        // Uppdaterar anteckningens data
        note.title = title;
        note.text = text;
        note.modifiedAt = new Date();

        // Sparar ändringarna i databasen
        await noteDb.update({ _id: id }, note);
        // Skickar tillbaka den uppdaterade anteckningen
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ error: 'Kunde inte uppdatera anteckning' });
    }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Radera en anteckning
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID för anteckningen som ska tas bort
 *     responses:
 *       200:
 *         description: Anteckning borttagen
 *       404:
 *         description: Anteckning hittades inte
 *       401:
 *         description: Ej auktoriserad
 */

// DELETE /api/notes/:id - Radera en anteckning
router.delete('/:id', authenticate, async (req, res) => {
    // Plockar ut anteckningens id från URL-parametrarna
    const { id } = req.params;

    try {
        // Letar upp anteckningen som ska raderas och kontrollerar att den tillhör rätt användare
        const note = await noteDb.findOne({ _id: id, userId: req.user.id });
        if (!note) return res.status(404).json({ error: 'Anteckning ej funnen' });

        // Tar bort anteckningen från databasen
        await noteDb.remove({ _id: id });
        // Skickar tillbaka en bekräftelse på borttagning
        res.status(200).json({ message: 'Anteckning borttagen' });
    } catch (error) {
        res.status(500).json({ error: 'Kunde inte ta bort anteckning' });
    }
});



/**
 * @swagger
 * /api/notes/search:
 *   get:
 *     summary: Sök bland anteckningar efter titel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Textsträng att söka efter i anteckningstitlar
 *     responses:
 *       200:
 *         description: Lista med matchande anteckningar
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       400:
 *         description: Sökord saknas
 *       401:
 *         description: Ej auktoriserad
 */

// GET /api/notes/search - Söka bland anteckningar efter titel
router.get('/search', authenticate, async (req, res) => {
    // Plockar ut sökordet från query-parametern
    const { title } = req.query;

    // Kontrollerar att sökord är angivet
    if (!title) {
        return res.status(400).json({ error: 'Sökord saknas' });
    }

    try {
        // Söker efter anteckningar där titeln matchar sökordet (case insensitive)
        const notes = await noteDb.find({
            userId: req.user.id,
            title: { $regex: title, $options: 'i' }, // $options: 'i' betyder "ignore case"
        });
        // Skickar tillbaka de matchande anteckningarna
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Kunde inte söka anteckningar' });
    }
});

export default router;