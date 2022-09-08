const db = require('../util/database');
const shared = require('./shared');

module.exports = class animes {
  // get all anime
  static getAnmies = () => {
    return new Promise((resolve, reject) => {
      db.pool.query('SELECT * FROM anime;', (err, records) => {
        if (err) {
          return reject(err);
        } else {
          (async () => {
            await shared.convertRecordsGenresIdToLabels(records);
            return resolve(records);
          })();
        }
      });
    });
  };

  // get all anime
  static anime = (query) => {
    return new Promise((resolve, reject) => {
      db.pool.query(query, (err, records) => {
        if (err) {
          return;
        } else {
          (async () => {
            await shared.convertRecordsGenresIdToLabels(records);
            return resolve(records);
          })();
        }
      });
    });
  };

  // get all genres
  static getGenres = () => {
    return new Promise((resolve, reject) => {
      (() => {
        db.pool.query('SELECT * FROM genres;', (err, records) => {
          if (err) return;

          return resolve(records);
        });
      })();
    });
  };

  // add an anime to database
  static addAnime = (body) => {
    return new Promise((resolve, reject) => {
      (() => {
        db.pool.query(`INSERT INTO anime SET ?`, body, (err, records) => {
          if (err) return;

          return resolve(records);
        });
      })();
    });
  };

  // delete an anime to database
  static deleteAnime = (id) => {
    return new Promise((resolve, reject) => {
      (() => {
        db.pool.query(
          `DELETE FROM anime WHERE anime.anime_id = ?`,
          id,
          (err, records) => {
            if (err) return;

            return resolve(records);
          }
        );
      })();
    });
  };

  // update an anime from database
  static updateAnime = (id, body) => {
    return new Promise((resolve, reject) => {
      (() => {
        const {
          name,
          description,
          cover,
          img,
          other_names,
          premiered,
          genre,
          scores,
          status,
          season,
        } = body;

        const query = `UPDATE anime SET 
        name = "${name}", description = "${description}", 
        img = "${img}", cover = "${cover}",
       other_names = "${other_names}",  premiered = "${premiered}", 
       genre = "${genre}", scores = "${scores}",
       status = "${status}", season = "${season}"
        WHERE anime_id = ${id};`;

        db.pool.query(query, (err, records) => {
          if (err) return;

          return resolve(records);
        });
      })();
    });
  };
  // get a specific anime from anime table
  static getOneAnime = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query(
        `select * from anime where anime_id = ${id}`,
        (err, records) => {
          if (err) return;

          (async () => {
            return resolve(
              await shared.convertRecordsGenresIdToLabels(records)
            );
          })();
        }
      );
    });
  };
};
