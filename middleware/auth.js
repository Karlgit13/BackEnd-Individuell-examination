// Importerar jsonwebtoken-biblioteket
import jwt from 'jsonwebtoken';

// exporterar en authenticate funktion som ser till att användaren är inloggad
// hämtar authorization-headern från requesten
// om det inte finns någon auth-header skickas 401 unauthorized 
// auth-header delas på mellanslag och hämtar själva token delen
// försöker verifiera token med hemliga nycklen (JWT)
// om verifiering lyckas läggs den dekodade användardatan till på request-objektet
// next används för gå vidare till nästa middleware/route-handler
// catch fångar om token är ogiltlig eller verifiering misslyckas och skickar tillbaka 401 unauthorized
export const authenticate = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ error: 'Missing token' });

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
