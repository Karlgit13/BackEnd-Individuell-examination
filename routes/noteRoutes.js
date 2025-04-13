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

// GET /api/notes - Hämta alla anteckningar
router.get('/', authenticate, async (req, res) => {
    try {
        const notes = await noteDb.find({ userId: req.user.id });
        res.status(200).json(notes);
    } catch (error) {
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

// POST /api/notes - Spara en anteckning
router.post('/', authenticate, async (req, res) => {
    const { title, text } = req.body;
    if (!title || title.length > 50 || !text || text.length > 300) {
        return res.status(400).json({ error: 'Ogiltig anteckning' });
    }

    try {
        const newNote = {
            title,
            text,
            createdAt: new Date(),
            modifiedAt: new Date(),
            userId: req.user.id,
        };
        const savedNote = await noteDb.insert(newNote);
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

// PUT /api/notes - Ändra en anteckning
router.put('/:id', authenticate, async (req, res) => {
    const { title, text } = req.body;
    const { id } = req.params;

    if (!title || title.length > 50 || !text || text.length > 300) {
        return res.status(400).json({ error: 'Ogiltig anteckning' });
    }

    try {
        const note = await noteDb.findOne({ _id: id, userId: req.user.id });
        if (!note) return res.status(404).json({ error: 'Anteckning ej funnen' });

        note.title = title;
        note.text = text;
        note.modifiedAt = new Date();

        await noteDb.update({ _id: id }, note);
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

// DELETE /api/notes - Ta bort en anteckning
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const note = await noteDb.findOne({ _id: id, userId: req.user.id });
        if (!note) return res.status(404).json({ error: 'Anteckning ej funnen' });

        await noteDb.remove({ _id: id });
        res.status(200).json({ message: 'Anteckning borttagen' });
    } catch (error) {
        res.status(500).json({ error: 'Kunde inte ta bort anteckning' });
    }
});

// GET /api/notes/search - Söka bland anteckningar (VG-krav)
router.get('/search', authenticate, async (req, res) => {
    const { title } = req.query;
    if (!title) {
        return res.status(400).json({ error: 'Sökord saknas' });
    }

    try {
        const notes = await noteDb.find({
            userId: req.user.id,
            title: { $regex: title, $options: 'i' }, // Söker på titel (case insensitive)
        });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Kunde inte söka anteckningar' });
    }
});

export default router;