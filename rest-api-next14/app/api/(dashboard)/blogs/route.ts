import { NextResponse } from "next/server";
import { Types } from "mongoose";

import connect from "@/lib/db";
import Blog from "@/lib/models/blog";
import User from "@/lib/models/user";
import Category from "@/lib/models/category";
import { start } from "repl";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");
    const searchKeywords = searchParams.get("keywords") as string;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page: any = parseInt(searchParams.get("page") || "1");
    const limit: any = parseInt(searchParams.get("limit") || "10");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Parámetro 'userId' inválido o ausente.",
        }),
        { status: 400 }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Parámetro 'categoryId' inválido o ausente.",
        }),
        { status: 400 }
      );
    }

    await connect();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          message: "Objeto 'user' no se ha encontrado en la base de datos.",
        }),
        { status: 400 }
      );
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return new NextResponse(
        JSON.stringify({
          message: "Objeto 'category' no se ha encontrado en la base de datos.",
        }),
        { status: 400 }
      );
    }

    const filter: any = {
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    };

    if (searchKeywords) {
      filter.$or = [
        {
          title: { $regex: searchKeywords, $options: "i" },
        },
        {
          description: { $regex: searchKeywords, $options: "i" },
        },
      ];
    }

    if (startDate && endDate) {
      filter.$createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
      };
    } else if (endDate) {
      filter.createdAt = {
        $lte: new Date(endDate),
      };
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: "asc" })
      .skip(skip)
      .limit(limit);

    return new NextResponse(
      JSON.stringify({
        blogs,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Hubo un error obteniendo la entrada del sitio. " + error.message,
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

    const body = await request.json();
    const { title, description } = body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Parámetro 'userId' inválido o ausente.",
        }),
        { status: 400 }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Parámetro 'categoryId' inválido o ausente.",
        }),
        { status: 400 }
      );
    }

    await connect();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          message: "Objeto 'user' no se ha encontrado en la base de datos.",
        }),
        { status: 400 }
      );
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return new NextResponse(
        JSON.stringify({
          message: "Objeto 'category' no se ha encontrado en la base de datos.",
        }),
        { status: 400 }
      );
    }

    const newBlog = new Blog({
      title,
      description,
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    });

    await newBlog.save();

    return new NextResponse(
      JSON.stringify({
        message: "La entrada ha sido creada.",
        category: newBlog,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Hubo un error creando la entrada del sitio. " + error.message,
      { status: 500 }
    );
  }
};
