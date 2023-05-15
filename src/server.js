const mongoose = require("mongoose");
const bot = require("./bot");
const app = require("./app");

const DB = process.env.DATABASE.replace("<password>", process.env.PASSWORD);

mongoose.connect(DB).then(() => {
  console.log("Database connected");
});

const PORT = process.env.PORT || 3001;

bot
  .launch()
  .then(() => {
    console.log("Bot started");
  })
  .catch((error) => {
    console.error("Error starting bot:", error);
  });

app.use(bot.webhookCallback("/bot"));
bot.telegram.setWebhook("https://study-bot-3ahq.onrender.com/bot");

app.listen(PORT, "", () => console.log("Server is running in port " + PORT));
