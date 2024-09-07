import Category from "@/lib/database/models/category";
import { NextResponse } from "next/server"
import { connect } from "@/lib/database/db";
import User from "@/lib/database/models/user";
import { Types } from "mongoose";
import Blog from "@/lib/database/models/blog";
const ObjectId = require("mongoose").Types.ObjectId;


export const GET = async (request, { params }) => {
    try {
        const blogId = params.id;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const categoryId = searchParams.get('categoryId');

        if (!blogId || !Types.ObjectId.isValid(blogId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing blogId" }), { status: 400 })

        if (!userId || !Types.ObjectId.isValid(userId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing userId" }), { status: 400 })

        if (!categoryId || !Types.ObjectId.isValid(categoryId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing categoryId" }), { status: 400 })


        await connect();

        const user = await User.findById(userId);
        if (!user)
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 })

        const category = await Category.findById(categoryId);
        if (!category)
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 })


        const blog = await Blog.findOne({
            _id: blogId,
            user: userId,
            category: categoryId
        });

        if (!blog)
            return new NextResponse(JSON.stringify({ message: "Blog not found" }), { status: 404 })

        return new NextResponse(JSON.stringify({ blog }), { status: 200 })

    } catch (error) {
        return new NextResponse("Error in fetching the blog, " + error.message, { status: 500 })
    }
}

export const PATCH = async (request, { params }) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const blogId = params.id;
        const { title, description } = await request.json();

        if (!userId || !Types.ObjectId.isValid(userId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing userId" }), { status: 400 })

        if (!blogId || !Types.ObjectId.isValid(blogId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing blogId" }), { status: 400 })

        await connect();

        const user = await User.findById(userId);
        if (!user)
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 })

        const blog = await Blog.findOne({
            _id: blogId,
            user: userId
        });

        if (!blog)
            return new NextResponse(JSON.stringify({ message: "Blog not found" }), { status: 404 })


        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { title, description },
            { new: true }
        );

        return new NextResponse(JSON.stringify({ message: "Blog updated successfully", blog: updatedBlog }), { status: 200 })

    } catch (error) {
        return new NextResponse("Error in updating the blog, " + error.message, { status: 500 })
    }
}

export const DELETE = async (request, { params }) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const blogId = params.id;

        if (!userId || !Types.ObjectId.isValid(userId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing userId" }), { status: 400 })

        if (!blogId || !Types.ObjectId.isValid(blogId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing blogId" }), { status: 400 })

        await connect();

        const user = await User.findById(userId);
        if (!user)
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 })

        const deletedBlog = await Blog.findByIdAndDelete(blogId);
        if (!deletedBlog)
            return new NextResponse(JSON.stringify({ message: "Could not delete the blog" }), { status: 400 })
        return new NextResponse(JSON.stringify({ message: "Blog deleted successfully", blog: deletedBlog }), { status: 200 })

    } catch (error) {
        return new NextResponse("Error in deleting the category, " + err.message, { status: 500 })
    }
}
