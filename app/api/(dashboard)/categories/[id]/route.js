import Category from "@/lib/database/models/category";
import { NextResponse } from "next/server"
import { connect } from "@/lib/database/db";
import User from "@/lib/database/models/user";
import { Types } from "mongoose";
const ObjectId = require("mongoose").Types.ObjectId;


export const PATCH = async (request, { params }) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const categoryId = params.id;
        const { title } = await request.json();

        if (!userId || !Types.ObjectId.isValid(userId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing userId" }), { status: 400 })

        if (!categoryId || !Types.ObjectId.isValid(categoryId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing categoryId" }), { status: 400 })

        await connect();

        const user = await User.findById(userId);
        if (!user)
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 })

        const category = await Category.findOne({
            _id: categoryId,
            user: userId
        });

        if (!category)
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 })


        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { title },
            { new: true }
        );

        if (!updatedCategory)
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 })

        return new NextResponse(JSON.stringify({ message: "Category updated successfully", category: updatedCategory }), { status: 200 })

    } catch (error) {
        return new NextResponse("Error in updating the category, " + error.message, { status: 500 })
    }
}

export const DELETE = async (request, { params }) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const categoryId = params.id;

        if (!userId || !Types.ObjectId.isValid(userId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing userId" }), { status: 400 })

        if (!categoryId || !Types.ObjectId.isValid(categoryId))
            return new NextResponse(JSON.stringify({ message: "Invalid or missing categoryId" }), { status: 400 })

        await connect();

        const user = await User.findById(userId);
        if (!user)
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 })

        const category = await Category.findOne({
            _id: categoryId,
            user: userId
        });

        if (!category)
            return new NextResponse(JSON.stringify({ message: "Category not found or does not belong to this user" }), { status: 404 })

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        return new NextResponse(JSON.stringify({ message: "Category deleted successfully", category: deletedCategory }), { status: 200 })

    } catch (error) {
        return new NextResponse("Error in deleting the category, " + err.message, { status: 500 })
    }
}
