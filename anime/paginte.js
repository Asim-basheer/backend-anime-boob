const db = require('../util/database');

module.exports = class search {
  // search by name
  static getPaginate = () => {
    return new Promise((resolve, reject) => {
      (() => {
        const query = `SELECT * FROM anime AS a WHERE a.name LIKE '${id}%'`;
        db.pool.query(query, (err, records) => {
          if (err) return;

          return resolve(records);
        });
      })();
    });
  };
};
