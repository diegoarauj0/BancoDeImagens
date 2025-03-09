import { Schema, model } from "mongoose"
import bcrypt from "bcryptjs"
import validator from "validator"


export interface IUser extends Document {
  username: string;
  email?: string;
  password?: string;
  googleID?: string;
  createdAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  createSession: () => { _id: string };
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    maxLength:16,
    minLength:1,
    trim: true,
  },

  password: {
    type: String,
    select: false,
    maxLength:64,
    minLength:8
  },

  email: {
    type: String,
    select: false,
    unique: true
  },

  googleID: {
    type: String,
    unique: true,
    sparse: true,
  },

  createdAt: {
    type: Date,
    required: true,
    default:() => Date.now(),
    immutable: true
  }
})

userSchema.path("username").validate(function (username) {
  if (!this.isNew && !this.isModified('username')) return true

  if (!validator.matches(username, /^[a-zA-Z0-9_]+$/)) { return false }

  return true
}, "Path `username` can only have letters, numbers and _", "invalidCharacters")

userSchema.path("email").validate(function (email) {
  if (!this.isNew && !this.isModified('email')) return true

  if (!validator.isEmail(email)) { return false }

  return true
}, "Path `email` is not valid", "invalidEmail")

userSchema.path("password").validate(function (password) {
  if (!this.isNew && !this.isModified('password')) return true

  if (!validator.isStrongPassword(password, {
    minLowercase:1,
    minUppercase:1,
    minSymbols:1,
    minNumbers:1
  })) { return false }

  return true
}, "Path `password` is not strong. password must contain at least ${params.uppercase} uppercase letter, ${params.lowercase} lowercase letter, ${params.number} number, and ${params.special} special character.", "weakPassword--{ number:1, special:1, uppercase:1, lowercase:1 }")

userSchema.pre("save", async function(next) {
  if (!this.isModified('password')) return next()
    
  const salt = await bcrypt.genSalt(Number(process.env.PASSWORD_SALT))
  const hash = await bcrypt.hash(this.password as string, salt)

  this.password = hash
  next()
})

userSchema.methods.createSession = function() {
  return { _id:this._id.toString() }
}

userSchema.methods.comparePassword = function(password:string) {
  return bcrypt.compare(password, this.password)
}

export const userModel = model<IUser>("User", userSchema)