import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import * as jwt from "jsonwebtoken";
import * as bCrypt from "bcrypt";
import { hashPassword } from "../utils/utils";

const prisma = new PrismaClient();

const TOKEN_EXPIRATION = "24h";

const registerSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("CUSTOMER", "ADMIN"),
  phone: Joi.string(),
  address: Joi.string(),
  gender: Joi.string(),
  // dob: Joi.string(),
});

export const register = async (req: Request, res: Response) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    console.log(error);
    return;
  }

  const {
    email,
    password,
    name = "",
    role = "CUSTOMER",
    phone = undefined,
    address = undefined,
    gender = undefined,
  } = req.body;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(409).json({ message: "Email already exists" });
    return;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        address,
        gender,
      },
    });
    const { password, ...userWithoutPass } = user;

    // Generate token and set cookie
    const token = generateToken(user.id, user.role);
    res
      .cookie("access_token", token, {
        path: "/",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(201)
      .json(userWithoutPass);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const login = async (req: Request, res: Response) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  // Compare password
  const passwordMatch = await bCrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  // Generate token JWT
  const token = generateToken(user.id, user.role);

  // Set token in HTTP-only cookie and return user info
  const { password: _, id, ...userWithoutPassword } = user;
  res
    .cookie("access_token", token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json({ user: userWithoutPassword });
};

const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

export const logout = async (req: Request, res: Response) => {
  res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Logout successful" });
};

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const { password, ...userWithoutPass } = user;
  res.json(userWithoutPass);
};
