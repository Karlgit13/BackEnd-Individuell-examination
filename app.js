// Importerar dotenv-biblioteket som används för att läsa in variabler från en .env-fil till process.env
// Kör config() direkt för att ladda in miljövariablerna innan något annat körs
import dotenv from 'dotenv';
dotenv.config();

// Importerar express, vilket är det ramverk vi använder för att bygga vårt API
// Importerar cors, ett middleware som tillåter anrop från andra domäner (t.ex. frontend i React)
// Importerar våra route-filer för användare och anteckningar
// Importerar en funktion som sätter upp Swagger-dokumentationen
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import { setupSwagger } from './swagger.js';

// Skapar en ny instans av en Express-app
// Sätter porten som appen ska lyssna på – tar från .env om det finns, annars 3000 som standard
const app = express();
const PORT = process.env.PORT || 3000;

// Aktiverar CORS så frontend från annan domän kan kommunicera med API:et
// Gör så att Express kan tolka inkommande JSON-data i request-body
app.use(cors());
app.use(express.json());

// Definierar endpoint-prefix för användarroutes (ex. /api/user/login, /api/user/signup)
// Definierar endpoint-prefix för anteckningsroutes (ex. /api/notes)
app.use('/api/user', userRoutes);
app.use('/api/notes', noteRoutes);

// En global felhanterare – fångar upp oväntade fel och skickar ett 500 Internal Server Error-svar
app.use((err, req, res, next) => {
    console.error(err); // Loggar felet i serverns terminal
    res.status(500).json({ error: 'Internal server error' }); // Skickar ett felmeddelande till klienten
});

// Startar servern och lyssnar på den angivna porten – visar ett meddelande i terminalen
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Anropar funktionen som sätter upp Swagger UI för API-dokumentation på /api-docs
setupSwagger(app);
