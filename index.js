const { connection } = require('./database/connection');
const express = require('express');
const cors = require('cors');
const UserRoutes = require('./routes.js/user');
const FollorRoutes = require('./routes.js/follow');
const PublicationRoutes = require('./routes.js/publication');

connection();
const PORT = 3900;
const app = express();

// Setup CORS, JSON body parser and allow url encoded
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', UserRoutes);
app.use('/api', FollorRoutes);
app.use('/api', PublicationRoutes);

app.get('/', (_, res) => {
  return res.status(200).json({
    status: true,
    message: 'Connection successfully'
  });
});

app.listen(PORT);
