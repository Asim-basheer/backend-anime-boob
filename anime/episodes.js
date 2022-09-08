const db = require('../util/database');
const shared = require('./shared');

module.exports = class episodes {
  // search by name
  static episode = (query) => {
    return new Promise((resolve, reject) => {
      (() => {
        db.pool.query(query, async (err, records) => {
          if (err) return;
          await shared.convertRecordsGenresIdToLabels(records);
          return resolve(records);
        });
      })();
    });
  };
  // deleteEpisode
  static deleteEpisode = (id) => {
    return new Promise((resolve, reject) => {
      (() => {
        db.pool.query(
          'delete from episodes where episode_id = ?',
          id,
          (err, records) => {
            return resolve(records);
          }
        );
      })();
    });
  };

  // update episode
  static updateEpisode = (body) => {
    return new Promise((resolve, reject) => {
      (() => {
        db.pool.query(
          `UPDATE episodes SET episode_number = ${body.episode_number}, servers = '${body.servers}', anime_id = ${body.anime_id} WHERE episode_id = ${body.episode_id};`,
          (err, records) => {
            if (err) return reject(err);
            return resolve(records);
          }
        );
      })();
    });
  };
};
