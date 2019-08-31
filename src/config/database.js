module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'meetup',
  define: {
    timestamps: true,
    undescored: true,
    undescoredAll: true,
  },
};
