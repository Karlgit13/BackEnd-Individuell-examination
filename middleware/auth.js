// Importerar jsonwebtoken-biblioteket som används för att verifiera och hantera JWT-tokens
import jwt from 'jsonwebtoken';

// Exporterar en middleware-funktion som heter "authenticate" som ska användas i routes som kräver att användaren är inloggad
export const authenticate = (req, res, next) => {
    // Hämtar authorization-headern från requesten (där klienten skickar sin JWT-token)
    const header = req.headers.authorization;

    // Om det inte finns någon authorization-header skickar vi tillbaka ett svar med 401 Unauthorized
    if (!header) return res.status(401).json({ error: 'Missing token' });

    // Dela upp authorization-headern på mellanslag (" ") och hämta själva token-delen (det andra elementet i arrayen)
    // Exempel på header: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const token = header.split(' ')[1];

    try {
        // Försöker verifiera token med den hemliga nyckeln (JWT_SECRET) som vi laddat från vår .env-fil
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Om verifieringen lyckas, lägg till den dekodade användardatan på request-objektet (t.ex. req.user.id)
        req.user = decoded;

        // Gå vidare till nästa middleware eller route-handler
        next();
    } catch {
        // Om token är ogiltig eller verifieringen misslyckas, skicka tillbaka 401 Unauthorized
        res.status(401).json({ error: 'Invalid token' });
    }
};
