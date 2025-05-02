// Importerar Datastore från nedb-promises, vilket är en wrapper runt NeDB som använder Promises istället för callbacks
import Datastore from 'nedb-promises';

// Skapar en databasinstans för användare (users) med inställningar
// Filnamnet där alla användaruppgifter (t.ex. användarnamn och lösenord) sparas
// autoload gör så att databasen laddas automatiskt när servern startar
const userDb = Datastore.create({

    filename: './db/users.db',
    autoload: true
});

// Exporterar userDb så att vi kan använda databasen i andra filer, till exempel för att hantera registrering och inloggning
export default userDb;
