import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: Buffer, // Store uploaded profile image as binary data
    },
    faceDescriptor: {
      type: [Number], // Array of 128 facial descriptor numbers
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length === 128 && arr.every(num => typeof num === "number");
        },
        message: "Invalid face descriptor. It must be an array of 128 numbers.",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
	  required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User };
