// models/noteModel.js
import Datastore from 'nedb-promises';

const noteDb = Datastore.create({
    filename: './db/notes.db',
    autoload: true
});

export default noteDb;
