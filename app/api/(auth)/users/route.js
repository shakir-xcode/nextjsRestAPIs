import { NextResponse } from "next/server"
import { connect } from "@/lib/database/db";
import User from "@/lib/database/models/user";
import { z } from "zod";
import bcrypt from 'bcrypt';
import { Types } from "mongoose";

const ObjectId = require("mongoose").Types.ObjectId;

async function hashPassword(password) {
	const saltRounds = 10; // Adjust this to increase the computational cost
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	return hashedPassword;
}


export const GET = async () => {
	try {
		await connect();
		const users = await User.find({});
		return new NextResponse(JSON.stringify(users), {
			status: 200
		})
	} catch (error) {
		console.log(error)
		return new NextResponse("Error in fetching users, " + error.message, {
			status: 500
		})
	}
}


const userSchema = z.object({
	email: z.string().email(),
	username: z.string().min(4).max(12),
	password: z.string().min(8).regex(/^[a-zA-Z0-9]+$/)
})

export const POST = async (request) => {

	try {
		const { email, username, password } = await request.json();

		const result = userSchema.safeParse({ email, username, password })
		if (!result.success) {
			const errors = result.error.formErrors.fieldErrors;
			return new NextResponse(JSON.stringify(errors), { status: 500 })
		}

		await connect();

		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		console.log(existingUser)
		console.log(email)

		if (existingUser?.username === username) {
			return new NextResponse("username already taken", { status: 400 })
		}

		if (existingUser?.email === email || existingUser) {
			return new NextResponse("User already exists", { status: 400 })
		}

		console.log(email)
		const newUser = new User({ email, username, password: await hashPassword(password) });
		await newUser.save();

		return new NextResponse(
			JSON.stringify({ message: "User is created", user: newUser }), { status: 200 }
		);

	} catch (error) {
		return new NextResponse("Error in creating user, " + error.message, { status: 500 }
		);
	}

}

export const PATCH = async (request) => {
	try {

		const body = await request.json();
		const { userId, newUsername } = body;

		// no username and userID
		if (!userId && !newUsername)
			return new NextResponse(JSON.stringify({ message: "No userID or username found" }), { status: 400 })

		// valid userID
		if (!Types.ObjectId.isValid(userId))
			return new NextResponse(JSON.stringify({ message: "Invaid userID" }), { status: 400 })


		await connect();
		const updatedUser = await User.findOneAndUpdate(
			{ _id: new ObjectId(userId) },
			{ username: newUsername },
			{ new: true }
		);

		if (!updatedUser)
			return new NextResponse(JSON.stringify({ message: "User not found in database" }), { status: 400 })

		return new NextResponse(JSON.stringify({ message: "User updated successfully", user: updatedUser }), { status: 200 })

	} catch (err) {
		console.log(err)
		return new NextResponse("Error in updating the user, " + err.message, { status: 500 })
	}
}

export const DELETE = async (request) => {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');

		// no username and userID
		if (!userId)
			return new NextResponse(JSON.stringify({ message: "No userID found" }), { status: 400 })

		// valid userID
		if (!Types.ObjectId.isValid(userId))
			return new NextResponse(JSON.stringify({ message: "Invaid userID" }), { status: 400 })


		await connect();
		const deletedUser = await User.findByIdAndDelete(
			new ObjectId(userId)
		);

		if (!deletedUser)
			return new NextResponse(JSON.stringify({ message: "User not found in database" }), { status: 400 })

		return new NextResponse(JSON.stringify({ message: "User deleted successfully", user: deletedUser }), { status: 200 })

	} catch (error) {
		return new NextResponse("Error in deleting the user, " + err.message, { status: 500 })
	}
}












