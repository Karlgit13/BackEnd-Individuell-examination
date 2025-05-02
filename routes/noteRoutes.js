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

// en GET-route defineras för att hämta anteckningar
// den skyddas av authenticate-middleware vilket innebär att endast inloggade användare får åtkomst.
// i try-satsen hämtas alla anteckningar som tillhör den inloggade användaren och skickar status 200 OK
// catch fångar errror och returnerar 500 server error.
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

// definerar en POST-route för att skapa anteckningar
// authenticate middleware körs
// title och text plockas ut från request body
// title och text valideras
// en ny anteckninig skapas och sparas i databasen
// när anteckningen sparats skickas den tillbaka till klienten med status 200 OK
// om något går fel fångas felet och ett svar med status 500 skickas tillbaka
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
            userId: req.user.id, // Kopplar anteckningen till den inloggade användaren
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

// definerar en PUT-route för att uppdatera anteckningar
// authenticate middleware körs
// title och text plockas från req body och valideras
// antecknings id plockas ut från URL-parametrarna
// anteckning letas upp och om anteckning inte hittas returneras status 404 med ett meddelande
// anteckningens data uppdateras, sparas i databasen och returnerar status 200 OK
// catch fångar error och returnerar status 500
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

// definerar en DELETE-route för att radera anteckningar
// authenticate middleware körs
// id plockas ut från URL-parametrar
// Letar upp anteckningen som ska raderas och kontrollerar att den tillhör rätt användare
// anteckningen tas bort och returnerar status 200 OK
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

// definerar en GET-route för att söka efter anteckningar
// authenticate middleware körs
// title hämtas från URL-parametrar
// om title inte hittas returneras status 400 med meddelande
// om title hittas returneras status 200 OK
router.get('/search', authenticate, async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ error: 'Sökord saknas' });
    }

    try {
        const regex = new RegExp(title, 'i'); // Skapa en riktig RegExp här!

        const notes = await noteDb.find({
            userId: req.user.id,
            title: regex
        });

        res.status(200).json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kunde inte söka anteckningar' });
    }
});


export default router;