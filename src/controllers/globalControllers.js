const { menuKeyboard } = require("../variables");

exports.commands = ["/start", "/gettests", "Asosiy Menu"];

exports.isGlobalCommand = (ctx) => {
  const isCommand = ctx.message && this.commands.includes(ctx.message.text);
  isCommand &&
    ctx.reply("Asosiy menyuga qaytingiz", {
      reply_markup: {
        resize_keyboard: true,
        keyboard: menuKeyboard,
      },
    });
  return isCommand;
};
