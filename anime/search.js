const db = require('../util/database');
const shared = require('./shared');

module.exports = class search {
  // search by name
  static searchByName = (id) => {
    return new Promise((resolve, reject) => {
      (() => {
        const query = `SELECT * FROM anime AS a WHERE a.name LIKE '${id}%'`;
        db.pool.query(query, (err, records) => {
          if (err) {
            return reject(err);
          }
          return resolve(records);
        });
      })();
    });
  };
  // squicksearch
  static quickSearch = (body) => {
    return new Promise((resolve, reject) => {
      (() => {
        db.pool.query('select * from anime;', async (err, result) => {
          if (err) return;

          await shared.convertRecordsGenresIdToLabels(result);

          if (body.name === 'genre') {
            const filter = result.filter((anime) =>
              anime.genre.find((genre) => genre === body.value)
            );
            return resolve(filter);
          } else if (body.name === 'season') {
            const filter = result.filter(
              (anime) => anime.season === body.value
            );
            return resolve(filter);
          }
        });
      })();
    });
  };
};
