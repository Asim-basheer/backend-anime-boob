const db = require("../util/database");

module.exports = class shared {
  static getGenreNameById = (id) => {
    return new Promise((resolve) => {
      db.pool.query(
        "select genre_name  from genres where genre_id = ? ",
        id,
        (err, records) => {
          if (err) {
            return;
          } else if (records.length > 0) {
            return resolve(records[0].genre_name);
          } else {
            return;
          }
        }
      );
    });
  };

  static convertGenersIdToLabels = (genresId) => {
    let genres = [];
    return new Promise((resolve, reject) => {
      (async () => {
        for (let id of genresId) {
          let genre = await this.getGenreNameById(id);
          genres.push(genre);
        }
        return resolve(genres);
      })();
    });
  };

  static convertRecordsGenresIdToLabels = (records) => {
    return new Promise((resolve, reject) => {
      (async () => {
        for (let record of records) {
          record.genre = JSON.parse(record.genre);
          record.genre = await this.convertGenersIdToLabels(record.genre);
        }
        return resolve(records);
      })();
    });
  };
};
