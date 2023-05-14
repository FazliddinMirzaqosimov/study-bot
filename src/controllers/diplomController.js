exports.createTest = new Scenes.WizardScene(
  "get-diplom",
  (ctx) => {
    return ctx.wizard.next();
  },
  (ctx) => {
    return ctx.scene.leave();
  }
);
