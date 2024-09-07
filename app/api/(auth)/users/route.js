import {NextResponse} from "next/server"
import {connect} from "@/lib/database/db";
import User from "@/lib/database/models/user";
import { z } from "zod";
import bcrypt from 'bcrypt';


async function hashPassword(password) {
  const saltRounds = 10; // Adjust this to increase the computational cost
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
}


export const GET = async () => {
	try{
		await connect();
		const users = await User.find({});
		return new NextResponse(JSON.stringify(users), {
			status: 200
		})		
	} catch (error) {
		console.log(error)
		return new NextResponse("Error in fetching users, "+error.message,{
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

	try{
		const {email, username, password} = await request.json();

		const result = userSchema.safeParse({email, username, password})	
		if(!result.success) {
			const errors = result.error.formErrors.fieldErrors;
			return new NextResponse(JSON.stringify(errors), {status: 500})
		}

		await connect();
		
		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		console.log(existingUser)
		console.log(email)
		
		if( existingUser?.username === username) {
			return new NextResponse("username already taken", {status: 400})
		}

		if (existingUser?.email === email || existingUser) {
			return new NextResponse("User already exists", {status: 400})
		} 
		
		console.log(email)
		const newUser = new User({email, username, password: await hashPassword(password)});
		await newUser.save();

		return new NextResponse(
			JSON.stringify({message: "User is created", user: newUser}), {status: 200}
		);
		
	} catch(error) {
		return new NextResponse("Error in creating user, "+error.message, {status: 500}
		);
	}

}