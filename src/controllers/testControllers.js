const { Scenes } = require("telegraf");
const Test = require("../modules/testModel");
const { menuKeyboard } = require("../variables");
const { checkAnswers } = require("../utils/checkAnswers");
const {
  addUserTokenTests,
  addUserTookenTests,
  isUserTookenTest,
} = require("../utils/userTookenTests");

exports.createTest = new Scenes.WizardScene(
  "create-test",
  async (ctx) => {
    ctx.reply("Enter your test file as a doc", {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [
            {
              text: "Back",
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
    if (ctx.message.text === "Back") {
      ctx.reply("You leave a test choose one oof category that you like", {
        reply_markup: {
          resize_keyboard: true,
          keyboard: menuKeyboard,
        },
      });
      return ctx.scene.leave();
    }

    if (!ctx.message.document) {
      ctx.reply(
        "You didnt enter document! Please enter your question as doc format"
      );
      return;
    }
    ctx.wizard.state.data.docId = ctx.message.document.file_id;
    ctx.reply("Enter the answers like e.x: abcdadcbcdbacbacd");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message.text) {
      ctx.reply("You have to enter answers in text e.x:acbdcbcdbaadbba");
      return;
    } else if (ctx.message.text === "Back") {
      ctx.reply("You leave a test choose one of category that you like", {
        reply_markup: {
          resize_keyboard: true,
          keyboard: menuKeyboard,
        },
      });
      return ctx.scene.leave();
    }

    try {
      ctx.wizard.state.data.answers = ctx.message.text;

      const test = await Test.create(ctx.wizard.state.data);
      ctx.reply(`Test succesfuly created! testid is ` + test._id, {
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
              text: "Back",
            },
          ],
        ],
      },
    });

    ctx.wizard.state.data = {};

    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message.text === "Back") {
      ctx.reply("You leave a test choose one of category that you like", {
        reply_markup: {
          resize_keyboard: true,
          keyboard: menuKeyboard,
        },
      });
      return ctx.scene.leave();
    }
    if (await isUserTookenTest(ctx.session.user._id, ctx.message.text)) {
      ctx.reply("You took this test try another");
      return;
    }
    const test = await Test.findById(ctx.message.text);
    console.log(test);
    if (!test) {
      ctx.reply("There is no test in this id. try another");
      return;
    }
    console.log(test);
    ctx.wizard.state.data.test = test;
    ctx.sendDocument(test.docId[0], {
      caption: "Enter the answers like e.x: abcdadcbcdbacbacd",
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    try {
      const answers = checkAnswers(
        ctx.message.text,
        ctx.wizard.state.data.test.answers
      );
      if (answers.trueAnswersCount < 0) {
        ctx.reply(
          `Your answer must be  ${ctx.wizard.state.data.test.answers.length}. But you  give me ${ctx.message.text.length}`
        );
        return;
      }
      await addUserTookenTests(ctx.session.user._id, {
        userTrueAnswers: answers.trueAnswersCount,
        test: ctx.wizard.state.data.test._id,
      });

      let message = "Your test results are:\n";
      answers.compareAnswers.forEach((ans) => {
        message += `\n${ans.quesNumber} ${ans.userAnswer}${
          ans.userAnswer === ans.trueAnswer ? "✅" : "❌"
        }`;
      });
      message += "\n\nTrue answers are " + ctx.wizard.state.data.test.answers;

      ctx.reply(message, {
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
    }

    return ctx.scene.leave();
  }
);
