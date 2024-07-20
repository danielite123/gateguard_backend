import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const { Schema } = mongoose;

const orderSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // This should match the model name of your user schema
    required: true,
  },
  driver: {
    type: Schema.Types.ObjectId,
    ref: "Driver",
    default: null,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"], // Example status values
    default: "pending",
  },
});

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
    },
    age: {
      type: Number,
      validate: {
        validator: function (v) {
          return v >= 21;
        },
        message: "Driver must be at least 21 years old",
      },
    },
    password: {
      type: String,
      required: [true, "Name is required"],
      minLength: [8, "Password must be at least 8 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone No is required"],
    },
    profilePic: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    driverLicense: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    orders: [orderSchema],
  },
  { timestamps: true }
);

//functions
//hash function
driverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// compare function
driverSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//jwt token
driverSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const driverModel = mongoose.model("Drivers", driverSchema);

export default driverModel;
