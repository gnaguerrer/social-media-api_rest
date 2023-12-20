const { connection } = require('./database/connection');
const express = require('express');
const cors = require('cors');

connection();
const PORT = 3900;
const app = express();

// Setup CORS, JSON body parser and allow url encoded
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UserRoutes = require('./routes/user');
const FollorRoutes = require('./routes/follow');
const PublicationRoutes = require('./routes/publication');

app.use('/api', UserRoutes);
app.use('/api/follow', FollorRoutes);
app.use('/api', PublicationRoutes);

app.get('/', (_, res) => {
  return res.status(200).json({
    status: true,
    message: 'Connection successfully'
  });
});

app.listen(PORT);
