const { Telegraf, session, Markup } = require("telegraf");
const dotenv = require("dotenv");
const { Stage } = require("telegraf/scenes");
const { loginWizard, routeProtector } = require("./controllers/authController");
const {
  createTest,
  takeATest,
  getTestAllResults,
  getAllTests,
} = require("./controllers/testControllers");
const { menuKeyboard, settingsKeyboard } = require("./variables");
const Test = require("./modules/testModel");
const { changeName, changeNumber } = require("./controllers/settingController");

dotenv.config();
const loginStage = new Stage([
  loginWizard,
  createTest,
  takeATest,
  changeName,
  changeNumber,
]);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(loginStage.middleware());
bot.use(routeProtector);

bot.start((ctx) => {
  ctx.reply("Assalomu aleykum!", {
    reply_markup: {
      keyboard: menuKeyboard,
      resize_keyboard: true,
    },
  });
});

bot.command("gettests", getAllTests);

bot.hears("Test Yaratish", (ctx) => {
  ctx.scene.enter("create-test");
});

bot.hears("Test Yechish", (ctx) => {
  ctx.scene.enter("take-test");
});

bot.hears("Sozlamalar", (ctx) => {
  ctx.reply("Sozlamalar bo'limi", {
    reply_markup: { resize_keyboard: true, keyboard: settingsKeyboard },
  });
});

bot.hears("Asosiy Menu", (ctx) => {
  ctx.reply("Menuga qaytdingiz", {
    reply_markup: {
      keyboard: menuKeyboard,
      resize_keyboard: true,
    },
  });
});
bot.hears("Ismni o'zgartirish", (ctx) => {
  ctx.scene.enter("change-name");
});
bot.hears("Raqamni o'zgartirish", (ctx) => {
  ctx.scene.enter("change-number");
});
bot.hears("Sizning Ma'lumotlaringiz", (ctx) => {
  ctx.reply(`Ismingiz: ${ctx.session.user.fullName}
Telefon: ${ctx.session.user.phoneNumber}
Telegram id: ${ctx.session.user.tgId}`);
});

bot.on("callback_query", getTestAllResults);

module.exports = bot;
