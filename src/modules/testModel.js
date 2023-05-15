const { default: mongoose } = require("mongoose");

const testSchema = new mongoose.Schema({
  docId: [String],
  imageId: [String],
  answers: String,
  authorId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
 
  tookenUsers: {
    select: false,
    default: [],
    type: [
      {
        userTrueAnswers: Number,
        user: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  title: String,
  created: Date,
});

testSchema.pre("save", function (next) {
  const currentDate = new Date();
  this.created = currentDate;
  next();
});

const Test = mongoose.model("Test", testSchema);
module.exports = Test;
