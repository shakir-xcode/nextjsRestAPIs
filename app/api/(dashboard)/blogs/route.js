import { NextResponse } from "next/server"
import { connect } from "@/lib/database/db";
import Category from "@/lib/database/models/category";
import User from "@/lib/database/models/user";
import { Types } from "mongoose";
import Blog from "@/lib/database/models/blog";
const ObjectId = require("mongoose").Types.ObjectId;


export const GET = async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const searchKeywords = searchParams.get("keywords");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page = searchParams.get("page") || 1;
        const limit = searchParams.get("limit") || 10;


        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId" }),
                {
                    status: 400,
                }
            )
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing categoryId" }),
                {
                    status: 400,
                }
            )
        }

        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "User not found" }),
                {
                    status: 404,
                }
            )
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return new NextResponse(
                JSON.stringify({ message: "Category not found" }),
                {
                    status: 404,
                }
            )
        }

        const filter = {
            user: new ObjectId(userId),
            category: new ObjectId(categoryId)
        }

        if (searchKeywords) {
            filter.$or = [
                {
                    title: { $regex: searchKeywords, $options: "i" }
                },
                {
                    description: { $regex: searchKeywords, $options: "i" }
                }
            ]
        }

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        } else if (startDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
            }
        } else if (endDate) {
            filter.createdAt = {
                $lte: new Date(endDate),
            }
        }

        const skip = (page - 1) * limit;

        const blogs = await Blog
            .find(filter)
            .sort({ createdAt: "asc" })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        if (!blogs)
            return new NextResponse(
                JSON.stringify({ message: "No blog found" }),
                {
                    status: 404,
                }
            )

        return new NextResponse(
            JSON.stringify({ blogs }),
            {
                status: 200,
            }
        )
    } catch (error) {
        return new NextResponse(
            "Error in fetching blogs ," + error.message,
            {
                status: 500,
            }
        )
    }

}


export const POST = async (request) => {
    try {

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const { title, description } = await request.json();

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId" }),
                {
                    status: 400,
                }
            )
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing categoryId" }),
                {
                    status: 400,
                }
            )
        }

        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "User not found" }),
                {
                    status: 404,
                }
            )
        }

        const category = await Category.findById(categoryId)
        if (!category) {
            return new NextResponse(
                JSON.stringify({ message: "Category not found" }),
                {
                    status: 404,
                }
            )
        }

        const newBlog = new Blog({
            title,
            description,
            user: new ObjectId(userId),
            category: new ObjectId(categoryId)
        });

        await newBlog.save();

        return new NextResponse(
            JSON.stringify({ message: "Blog creted successfully", blog: newBlog }),
            {
                status: 200,
            }
        )
    } catch (error) {
        return new NextResponse(
            "Error in creating blog ," + error.message,
            {
                status: 500,
            }
        )
    }

}