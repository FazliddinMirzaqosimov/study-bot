const { Scenes } = require("telegraf");
const User = require("../modules/userModule");
const { menuKeyboard } = require("../variables");

exports.loginWizard = new Scenes.WizardScene(
  "login-wizard",
  async (ctx) => {
    ctx.reply("Soorry You are not logged in. Enter your fullName");
    ctx.wizard.state.data = {};
    ctx.wizard.state.data.tgId = ctx.from.id;
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.data.fullName = ctx.message.text;
    ctx.reply("Enter your phone number", {
      reply_markup: {
        keyboard: [
          [
            {
              text: "Share contact",
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.data.phoneNumber =
      ctx.message.text || ctx.message.contact.phone_number;
    const user = await User.create(ctx.wizard.state.data);
    ctx.session.user = user;

    ctx.reply(`You are logged in`, {
      reply_markup: {
        keyboard: menuKeyboard,
        resize_keyboard: true,
      },
    });
    return ctx.scene.leave();
  }
);

// route protector
exports.routeProtector = async (ctx, next) => {
  if (ctx.session?.user) {
    return next();
  }
  ctx.session = {};
  const user = await User.findOne({ tgId: ctx.from.id });
  if (!user) {
    return ctx.scene.enter("login-wizard");
  }
  ctx.session.user = user;
  next();
};
