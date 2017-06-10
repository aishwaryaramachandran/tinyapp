const bcrypt = require('bcrypt');

const password = 'fluffybunny';
const hash = bcrypt.hashSync(password, 16);

console.log(password, hash)
  bcrypt.compareSync(password, hash);