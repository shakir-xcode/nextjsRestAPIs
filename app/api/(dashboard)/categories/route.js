import { NextResponse } from "next/server"
import { connect } from "@/lib/database/db";
import Category from "@/lib/database/models/category";
import User from "@/lib/database/models/user";
import { Types } from "mongoose";
const ObjectId = require("mongoose").Types.ObjectId;


export const GET = async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId" }),
                {
                    status: 400,
                }
            )
        }

        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "User not found in database" }),
                {
                    status: 400,
                }
            )
        }

        const categories = await Category.find({
            user: new Types.ObjectId(userId)
        });

        return new NextResponse(
            JSON.stringify({ categories }),
            {
                status: 200,
            }
        )
    } catch (error) {
        return new NextResponse(
            "Error in fetching categories ," + error.message,
            {
                status: 500,
            }
        )
    }

}


export const POST = async (request) => {
    try {

        const { userId, categoryTitle } = await request.json();

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId" }),
                {
                    status: 400,
                }
            )
        }

        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "User not found in database" }),
                {
                    status: 404,
                }
            )
        }

        const existingCategory = await Category.findOne({
            title: categoryTitle
        })
        if (existingCategory) {
            return new NextResponse(
                JSON.stringify({ message: "Category already exists" }),
                {
                    status: 400,
                }
            )
        }

        const newCategory = new Category({
            title: categoryTitle,
            user: new ObjectId(userId)
        });

        await newCategory.save();

        return new NextResponse(
            JSON.stringify({ message: "Category creted successfully", category: newCategory }),
            {
                status: 200,
            }
        )
    } catch (error) {
        return new NextResponse(
            "Error in fetching categories ," + error.message,
            {
                status: 500,
            }
        )
    }

}