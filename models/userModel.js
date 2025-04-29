// Importerar Datastore från nedb-promises, ett NeDB-bibliotek som använder Promises för enklare async-hantering
import Datastore from 'nedb-promises';

// Skapar en databasinstans för användare (users) med inställningar
const userDb = Datastore.create({
    // Filnamnet där alla användaruppgifter (t.ex. användarnamn och lösenord) sparas
    filename: './db/users.db',
    // Gör att databasen automatiskt laddas in när servern startar
    autoload: true
});

// Exporterar userDb så att vi kan använda databasen i andra filer, till exempel för att hantera registrering och inloggning
export default userDb;
