// models/userModel.js
import Datastore from 'nedb-promises';

const userDb = Datastore.create({
    filename: './db/users.db',
    autoload: true
});

export default userDb;
