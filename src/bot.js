const { Telegraf, session } = require("telegraf");
const dotenv = require("dotenv");
const { Stage } = require("telegraf/scenes");
const { loginWizard, routeProtector } = require("./controllers/authController");
const { createTest, takeATest } = require("./controllers/testControllers");
const { menuKeyboard } = require("./variables");
const Test = require("./modules/testModel");

dotenv.config();
const loginStage = new Stage([loginWizard, createTest, takeATest]);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(loginStage.middleware());
bot.use(routeProtector);

bot.start((ctx) => {
  ctx.reply("Hello welcome to study bot!", {
    reply_markup: {
      keyboard: menuKeyboard,
      resize_keyboard: true,
    },
  });
});

bot.command("create", (ctx) => {
  ctx.scene.enter("create-test");
});
bot.command("gettests", async (ctx) => {
  const tests = await Test.find();
  ctx.sendMessage(JSON.stringify(tests));
});
bot.hears("Test Yaratish", (ctx) => {
  ctx.scene.enter("create-test");
});

bot.hears("Test Yechish", (ctx) => {
  ctx.scene.enter("take-test");
});

module.exports = bot;
