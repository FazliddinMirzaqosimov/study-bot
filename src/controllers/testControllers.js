const { Scenes } = require("telegraf");
const Test = require("../modules/testModel");
const { menuKeyboard } = require("../variables");
const { checkAnswers } = require("../utils/checkAnswers");
const {
  addUserTokenTests,
  addUserTookenTests,
  isUserTookenTest,
} = require("../utils/userTookenTests");
const { json } = require("express");
const { default: mongoose } = require("mongoose");
const { isGlobalCommand } = require("./globalControllers");

exports.createTest = new Scenes.WizardScene(
  "create-test",
  async (ctx) => {
    ctx.reply("Enter your test file as a doc", {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [
            {
              text: "Asosiy Menu",
            },
          ],
        ],
      },
    });

    ctx.wizard.state.data = {};
    ctx.wizard.state.data.authorId = ctx.session.user._id;

    return ctx.wizard.next();
  },
  (ctx) => {
    if (isGlobalCommand(ctx)) {
      return ctx.scene.leave();
    }

    if (!ctx.message.document) {
      ctx.reply(
        "Siz savollarni dokument formatda kiritmadingiz. Qayta urunib ko'ring!"
      );
      return;
    }
    ctx.wizard.state.data.docId = ctx.message.document.file_id;
    ctx.reply("Test mavzusini kiriting!");
    return ctx.wizard.next();
  },
  (ctx) => {
    if (isGlobalCommand(ctx)) {
      return ctx.scene.leave();
    }

    ctx.wizard.state.data.title = ctx.message.text;
    ctx.reply("Javoblani quyidagicha kiriting: \nabcdadcbcdbacbacd");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message.text) {
      ctx.reply("Javoblani quyidagicha kiriting: \nabcdadcbcdbacbacd");
      return;
    } else if (isGlobalCommand(ctx)) {
      return ctx.scene.leave();
    }

    try {
      ctx.wizard.state.data.answers = ctx.message.text;

      const test = await Test.create(ctx.wizard.state.data);
      ctx.reply(`Test muvoffaqiyatli yaratildi! testingiz idisi:` + test._id, {
        reply_markup: {
          resize_keyboard: true,
          keyboard: menuKeyboard,
        },
      });
    } catch (error) {
      ctx.reply(error.message, {
        reply_markup: {
          resize_keyboard: true,
          keyboard: menuKeyboard,
        },
      });
      return;
    }

    return ctx.scene.leave();
  }
);

//take a test section for wizard scene

exports.takeATest = new Scenes.WizardScene(
  "take-test",
  async (ctx) => {
    ctx.reply("Enter your test id that you wanna pass", {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [
            {
              text: "Asosiy Menu",
            },
          ],
        ],
      },
    });

    ctx.wizard.state.data = {};

    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.callbackQuery?.data) {
      this.getTestAllResults(ctx);
      return ctx.scene.leave();
    }
    if (isGlobalCommand(ctx)) {
      return ctx.scene.leave();
    }

    if (await isUserTookenTest(ctx.session.user._id, ctx.message.text)) {
      ctx.reply(
        "Siz bu testni bajarip bo'lgansiz. Barcha natijalarni ko'rishi xohlasangiz quyidagi tugmani bosing!",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Natijalar", callback_data: `id_${ctx.message.text}` }],
            ],
          },
        }
      );
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(ctx.message.text)) {
      ctx.reply("Bu to'g'ri id emas");
      return;
    }
    const test = await Test.findById(ctx.message.text);
    if (!test) {
      ctx.reply("Bunday iddagi test topilmadi.boshqasini sinab ko'ring.");
      return;
    }
    ctx.wizard.state.data.test = test;
    ctx.sendDocument(test.docId[0], {
      caption: `Mavzu: ${test.title}\nJavoblani quyidagicha kiriting: \nabcdadcbcdbacbacd`,
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (isGlobalCommand(ctx)) {
      return ctx.scene.leave();
    }

    try {
      const answers = checkAnswers(
        ctx.message.text,
        ctx.wizard.state.data.test.answers
      );
      if (answers.trueAnswersCount < 0) {
        ctx.reply(
          `Sizning javobingiz  ${ctx.wizard.state.data.test.answers.length}ta bo'lishi kerak.Siz ${ctx.message.text.length}ta javob jo'natdingiz`
        );
        return;
      }
      await addUserTookenTests(
        ctx.session.user._id,
        ctx.wizard.state.data.test._id,
        answers.trueAnswersCount
      );

      let message = "Sizning test natijangiz:\n";
      answers.compareAnswers.forEach((ans) => {
        message += `\n${ans.quesNumber} ${ans.userAnswer}${
          ans.userAnswer === ans.trueAnswer ? "✅" : "❌"
        }`;
      });
      message += "\nTo'g'ri javoblar: " + ctx.wizard.state.data.test.answers;

      ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Natijalar", callback_data: `id_${ctx.message.text}` }],
          ],
          keyboard: menuKeyboard,
          resize_keyboard: true,
        },
      });
    } catch (error) {
      ctx.reply(error.message, {
        reply_markup: {
          resize_keyboard: true,
          keyboard: menuKeyboard,
        },
      });
    }

    return ctx.scene.leave();
  }
);

exports.getTestAllResults = async (ctx) => {
  try {
    const test = await Test.findById(ctx.callbackQuery.data.replace("id_", ""))
      .select("+tookenUsers")
      .populate("tookenUsers.user");

    let message = `Testda ${test.answers.length}ta savollar va ${test.tookenUsers.length}ta topshirgan odamlar bor:\n\n`;

    test.tookenUsers
      .sort((a, b) => b.userTrueAnswers - a.userTrueAnswers)
      .forEach((user, i) => {
        message += `\n${i + 1}. ${user.user.fullName} - ${
          user.userTrueAnswers
        }✅    ${(user.userTrueAnswers * 100) / test.answers.length}%`;
      });

    ctx.reply(message);
  } catch (error) {
    ctx.reply(error.message);
  }
};

exports.getAllTests = async (ctx) => {
  const tests = await Test.find();
  let message = "Barcha testlar ro'yxati:\n\n";

  tests.forEach(
    (test, i) =>
      (message += `\n${i + 1}) <b>Mavzu</b>: ${test.title}\n    <b>id</b>: <i>${
        test._id
      }</i>`)
  );
  ctx.replyWithHTML(message);
};
