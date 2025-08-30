const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:3000", // React dev local
      "https://dashing-basbousa-e64055.netlify.app/", // Ton site Netlify
    ],
    credentials: true,
  })
);
