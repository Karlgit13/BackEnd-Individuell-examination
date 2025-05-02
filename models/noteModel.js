// Importerar Datastore från nedb-promises, vilket är en wrapper runt NeDB som använder Promises istället för callbacks
import Datastore from 'nedb-promises';

// Skapar en databasinstans för anteckningar (notes) med konfiguration
// filen där alla anteckningar sparas
// autoload gör så att databasen laddas automatiskt när servern startar
const noteDb = Datastore.create({
    filename: './db/notes.db',
    autoload: true
});

// Exporterar databasinstansen så att den kan användas i andra filer (t.ex. i routes för att skapa, läsa, uppdatera och ta bort anteckningar)
export default noteDb;
