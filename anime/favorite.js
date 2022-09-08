const db = require('../util/database');
const shared = require('./shared');

module.exports = class favorites {
  // get favorites fron favorites table
  static getFavorite = (id) => {
    return new Promise((resolve, reject) => {
      (() => {
        const query = `
        SELECT * FROM anime as a 
         WHERE a.anime_id IN (
      SELECT anime_id FROM favorites AS f WHERE f.user_id = ${id} 
      );`;
        db.pool.query(query, async (err, records) => {
          if (err) {
            return reject(err);
          }

          await shared.convertRecordsGenresIdToLabels(records);
          return resolve(records);
        });
      })();
    });
  };
  // insert into  favorites
  static postToFavorite = (body) => {
    return new Promise((resolve, reject) => {
      (() => {
        db.pool.query('INSERT INTO favorites SET ?', body, (err, records) => {
          if (err) {
            return reject(err);
          }
          return resolve(records);
        });
      })();
    });
  };

  // delete an anime from favorite list
  static deleteFromFavorite = (anime_id, user_id) => {
    return new Promise((resolve, reject) => {
      (() => {
        db.pool.query(
          `DELETE FROM favorites WHERE anime_id = ${anime_id} AND user_id = ${user_id}`,
          (err, records) => {
            if (err) {
              return reject(err);
            }
            return resolve({ records });
          }
        );
      })();
    });
  };
};
