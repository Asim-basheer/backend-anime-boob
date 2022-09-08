const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const www = process.env.WWW || './';
const bodyParser = require('body-parser');
const paginate = require('jw-paginate');
const bcrypt = require('bcrypt');
const db = require('./util/database');
const cors = require('cors');

// ______________________
const animes = require('./anime/anime');
const search = require('./anime/search');
const shared = require('./anime/shared');
const episodes = require('./anime/episodes');
const favorites = require('./anime/favorite');

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, X-Custom-Header, Authorization, Origin'
  );
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});
app.use(express.static(www));

// paged items route
app.get('/paginate', (req, res, next) => {
  db.pool.query('select * from anime;', async (err, result) => {
    if (err) return;

    const page = parseInt(req.query.page) || 1,
      pager = paginate(result.length, page, 20),
      pageOfItems = result.slice(pager.startIndex, pager.endIndex + 1);

    await shared.convertRecordsGenresIdToLabels(pageOfItems);
    res.send({ pager, pageOfItems });
  });
});

app.get('/episode/get/:name', async (req, res) => {
  const name = req.params.name;
  if (name === 'episode') {
    const query = `select * from episodes as e join anime as a where e.anime_id = a.anime_id order by  e.episode_id DESC;`;
    const result = await episodes.episode(query);
    const page = parseInt(req.query.page) || 1,
      pager = paginate(result.length, page, 20),
      pageOfItems = result.slice(pager.startIndex, pager.endIndex + 1);
    res.send({ pager, pageOfItems });
  } else if (name === 'last') {
    const query =
      'select * from episodes as e join anime as a where e.anime_id = a.anime_id order by  e.episode_id DESC LIMIT 10; ';
    res.send(await episodes.episode(query));
  }
});

app.get('/anime/one/:id', async (req, res) => {
  const id = req.params.id;
  res.send(await animes.getOneAnime(id));
});

app.get('/anime/get/:name', async (req, res) => {
  const name = req.params.name;
  if (name === 'anime') {
    const query = 'Select * FROM anime ORDER BY anime.name;';
    const result = await animes.anime(query);
    const page = parseInt(req.query.page) || 1,
      pager = paginate(result.length, page, 20),
      pageOfItems = result.slice(pager.startIndex, pager.endIndex + 1);
    res.send({ pager, pageOfItems });
  } else if (name === 'top') {
    const query = 'Select * FROM anime ORDER BY anime.scores DESC LIMIT 10;';
    res.send(await animes.anime(query));
  } else if (name === 'last') {
    const query = 'Select * FROM anime ORDER BY anime.anime_id DESC LIMIT 6;';
    res.send(await animes.anime(query));
  }
});

// suggestions
app.get('/sugg/:name', async (req, res) => {
  // console.log(req.params.name);
  db.pool.query('select * from anime;', async (err, result) => {
    await shared.convertRecordsGenresIdToLabels(result);

    const filter = result.filter((anime) =>
      anime.genre.find((genre) => genre === req.params.name)
    );
    res.send(filter.slice(0, 6));
  });
});

// get all anime
app.get('/anime/get', async (req, res) => {
  res.send(await animes.getAnmies());
});

// ADD AN ANIME TO DATABASE
app.post('/anime/post', async (req, res) => {
  const body = req.body;

  res.send(await animes.addAnime(body));
});

// delete AN ANIME from DATABASE
app.delete('/anime/delete/:id', async (req, res) => {
  const id = req.params.id;

  db.pool.query(
    'delete from episdoes where anime_id = ?',
    id,
    (err, result) => {
      return;
    }
  );

  await animes.deleteAnime(id);
  // res.send(await animes.deleteAnime(id));
});

// update AN ANIME from DATABASE
app.put('/anime/update/:id', async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  res.send(await animes.updateAnime(Number(id), body));
});

// get all genres
app.get('/anime/genres', async (req, res) => {
  res.send(await animes.getGenres());
});

// get a specific anime from anime table
app.get('/anime/get/:id', async (req, res) => {
  const id = req.params.id;
  res.send(await animes.getOneAnime(id));
});

// search by name
app.get('/anime/searchbyname/:id?', async (req, res) => {
  const id = req.params.id;

  res.send(await search.searchByName(id));
});

// insert an episode to database
app.post('/episode/post', (req, res) => {
  const body = req.body;
  db.pool.query('insert into episodes set ?', body, (err, results) => {
    if (err) throw err;

    res.send(results);
  });
});

// delete AN episode from DATABASE
app.delete('/episode/delete/:id', async (req, res) => {
  const id = req.params.id;
  await episodes.deleteEpisode(id);
  res.send('deleted');
});

// update an episdoe
app.put('/episode/edit', async (req, res) => {
  await episodes.updateEpisode(req.body);

  res.send('updated');
});

// get an episode
app.get('/episode/:id', (req, res) => {
  db.pool.query(
    'select * from episodes where episode_id = ?',
    req.params.id,
    (err, result) => {
      result[0].servers = JSON.parse(result[0].servers);
      res.send(result[0]);
    }
  );
});

//quicksearch
app.post('/quicksearch', async (req, res) => {
  const body = req.body;

  res.send(await search.quickSearch(body));
});

// test
app.get('/episodesnumber/:id', (req, res) => {
  const id = req.params.id;
  db.pool.query(
    `select * from episodes join anime  where anime.anime_id = ${id} and episodes.anime_id = ${id} order by episode_number;`,
    async (err, result) => {
      if (err) return;
      await shared.convertRecordsGenresIdToLabels(result);
      res.send(result);
    }
  );
});

app.post('/episode', (req, res) => {
  const body = req.body;

  db.pool.query(
    `select * from episodes where episode_number = ${body.episode_number} and anime_id = ${body.anime_id};`,
    (err, result) => {
      if (err) return;

      for (let i of result) {
        i.servers = JSON.parse(i.servers);
      }

      res.send(result);
    }
  );
});

// ____________________________ favorites
// get favorites fron favorites table
app.get('/favorite/get/:id', async (req, res) => {
  const id = req.params.id;
  res.send(await favorites.getFavorite(id));
});

// post an anime to a favorite list
app.post('/favorite/add', async (req, res) => {
  const body = req.body;
  await favorites.postToFavorite(body);
  res.send('added');
});

// delete an anime from favorite list
app.post('/favorite/delete', async (req, res) => {
  const body = req.body,
    { user_id, anime_id } = body;

  await favorites.deleteFromFavorite(anime_id, user_id);

  res.send('deleted');
});

// _________________________ users

// get all users
app.get('/users/get', (req, res) => {
  db.pool.query('select * from users order by user_type;', (err, result) => {
    for (let i of result) {
      delete i.password;
    }
    res.send(result);
  });
});

// delete user
app.delete('/users/delete/:id', (req, res) => {
  const id = req.params.id;

  db.pool.query('delete from users where user_id = ?', +id, (err, result) => {
    if (err) return;

    res.send('deleted');
  });
});

// change type of user

app.put('/users/edit', (req, res) => {
  const body = req.body;

  db.pool.query(
    `update users set user_type = ${body.type} where user_id = ${body.user_id};`,
    (err, result) => {
      res.send(result);
    }
  );
});

// register
app.post('/auth/register', (req, res) => {
  const body = req.body;
  bcrypt.hash(body.password, 10, (err, hash) => {
    if (err) {
      console.log(err);
    }
    body.password = hash;
    db.pool.query('INSERT INTO users SET ?', body, (err, results) => {
      if (err) {
        if (err.errno === 1062) {
          res.send({ message: 'The email is already exists' });
        }
      } else {
        res.send(results);
      }
    });
  });
});

// login
app.post('/auth/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.pool.query(
    'SELECT * FROM users WHERE email = ?;',
    email,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            delete result[0].password;

            res.send({ result });
          } else {
            res.send({ message: 'Wrong email or password' });
          }
        });
      } else {
        res.send({ message: 'email is not exist' });
      }
    }
  );
});

app.get('*', function (req, res) {
  const index = path.join(__dirname, 'build', 'index.html');
  res.sendFile(index);
});

app.listen(port, () => console.log(`listening on http://localhost:${port}`));
