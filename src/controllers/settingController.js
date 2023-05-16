const { Scenes, session } = require("telegraf");
const { settingsKeyboard } = require("../variables");

exports.changeName = new Scenes.WizardScene(
  "change-name",
  (ctx) => {
    ctx.reply("Ismingizni kiriting: ", {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [
            {
              text: "Orqaga",
            },
          ],
        ],
      },
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message.text) {
      ctx.reply(`Iltimos text kiriting!`);
      return;
    }
    if (ctx.message.text === "Orqaga") {
      ctx.reply("Sozlamalar bo'limi", {
        reply_markup: { resize_keyboard: true, keyboard: settingsKeyboard },
      });
      return ctx.scene.leave();
    }

    ctx.session.user.fullName = ctx.message.text;
    await ctx.session.user.save();

    ctx.reply(`Ismingiz muvoffaqiyatli saqlandi!`, {
      reply_markup: { resize_keyboard: true, keyboard: settingsKeyboard },
    });

    return ctx.scene.leave();
  }
);

exports.changeNumber = new Scenes.WizardScene(
  "change-number",
  (ctx) => {
    ctx.reply("Yangi raqam kiriting: ", {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [
            {
              text: "Orqaga",
            },
          ],
        ],
      },
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message.text) {
      ctx.reply(`Iltimos text kiriting!`);
      return;
    }
    if (ctx.message.text === "Orqaga") {
      ctx.reply("Sozlamalar bo'limi", {
        reply_markup: { resize_keyboard: true, keyboard: settingsKeyboard },
      });
      return ctx.scene.leave();
    }

    ctx.session.user.phoneNumber = ctx.message.text;
    await ctx.session.user.save();

    ctx.reply(`Raqamingiz muvoffaqiyatli saqlandi!`, {
      reply_markup: { resize_keyboard: true, keyboard: settingsKeyboard },
    });

    return ctx.scene.leave();
  }
);
