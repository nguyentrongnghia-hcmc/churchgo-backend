const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Serve all static files from the root directory
// This includes index.html, index.tsx, components, etc.
app.use(express.static(path.join(__dirname, '/')));

// For any other request, send the index.html file
// This is crucial for single-page applications (SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
