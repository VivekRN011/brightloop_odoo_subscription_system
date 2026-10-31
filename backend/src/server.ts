import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`
====================================
BRIGHTLOOP API SERVER
====================================
Port: ${PORT}
Environment: ${process.env.NODE_ENV}
Status: Running
====================================
`);
});
