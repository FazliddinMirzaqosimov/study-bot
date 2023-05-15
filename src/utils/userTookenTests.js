const Test = require("../modules/testModel");
const User = require("../modules/userModule");

exports.addUserTookenTests = async (userId, testId, userTrueAnswers) => {
  //   test =  {
  //      userTrueAnswers: 3,
  //      test: "testId",
  //    },

  const user = await User.findById(userId).select("tookenTests");
  const test = await Test.findById(testId).select("tookenUsers");

  user.tookenTests = [...user.tookenTests, { userTrueAnswers, test: testId }];
  test.tookenUsers = [...test.tookenUsers, { userTrueAnswers, user: userId }];

  await Promise.all([user.save(), test.save()]);
  return user;
};
exports.isUserTookenTest = async (userId, testId) => {
  //   test =  {
  //      userTrueAnswers: 3,
  //      test: "testId",
  //    },

  const user = await User.findById(userId).select("tookenTests");

  const isTooken = user.tookenTests.find((userTest) => userTest.test == testId);
  return isTooken;
};
