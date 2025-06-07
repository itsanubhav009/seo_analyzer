const app = require('./index');

const PORT = process.env.PORT || 9000; // Try a very unusual port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});