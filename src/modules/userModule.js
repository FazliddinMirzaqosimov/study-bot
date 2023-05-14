const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, unique: true, required: true },
  tgId: { type: Number, unique: true, required: true },
  created: {
    type: Date,
  },
  tookenTests: {
    select: false,
    default: [],
    type: [
      {
        userTrueAnswers: Number,
        test: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "Test",
        },
      },
    ],
  },
});

userSchema.pre("save", function (next) {
  const currentDate = new Date();
  this.created = currentDate;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
