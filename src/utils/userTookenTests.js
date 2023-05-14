const User = require("../modules/userModule");

exports.addUserTookenTests = async (userId, test) => {
  //   test =  {
  //      userTrueAnswers: 3,
  //      test: "testId",
  //    },

  const user = await User.findById(userId).select("tookenTests");
  console.log(user);
  user.tookenTests = [...user.tookenTests, test];
  await user.save();

  return user;
};
exports.isUserTookenTest = async (userId, testId) => {
  //   test =  {
  //      userTrueAnswers: 3,
  //      test: "testId",
  //    },

  const user = await User.findById(userId).select("tookenTests");
  console.log(
    user.tookenTests.find((userTest) => userTest.test == testId),
    user.tookenTests
  );

  const isTooken = user.tookenTests.find((userTest) => userTest.test == testId);
  return isTooken;
};
