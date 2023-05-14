exports.checkAnswers = (userAnswers, trueAnswers) => {
  const result = {
    trueAnswersCount: 0,
    questions: trueAnswers.length,
    compareAnswers: [],
  };
  if (userAnswers.length !== trueAnswers.length) {
    result.trueAnswersCount--;
    return result;
  }
  userAnswers.split("").forEach((variant, index) => {
    variant === trueAnswers[index] && result.trueAnswersCount++;
    result.compareAnswers.push({
      quesNumber: index + 1,
      userAnswer: variant,
      trueAnswer: trueAnswers[index],
    });
  });
  return result;
};
