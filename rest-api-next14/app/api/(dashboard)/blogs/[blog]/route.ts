import { NextResponse } from "next/server";
import { Types } from "mongoose";

import connect from "@/lib/db";
import Category from "@/lib/models/category";
import Blog from "@/lib/models/blog";
import User from "@/lib/models/user";

export const GET = async (request: Request, context: { params: any }) => {
  const blogId = context.params.blog;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

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

    if (!blogId || !Types.ObjectId.isValid(blogId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Parámetro 'blogId' inválido o ausente.",
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

    const blog = await Blog.findOne({
      _id: blogId,
      user: userId,
      category: categoryId,
    });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({
          message: "La entrada no existe en la base de datos.",
        }),
        { status: 400 }
      );
    }

    return new NextResponse(JSON.stringify({ blog }), { status: 400 });
  } catch (error: any) {
    return new NextResponse(
      "Ocurrió un error obteniendo la entrada. " + error.message,
      {
        status: 500,
      }
    );
  }
};

export const PATCH = async (request: Request, context: { params: any }) => {
  const blogId = context.params.blog;

  try {
    const body = await request.json();
    const { title, description } = body;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Parámetro 'userId' inválido o ausente.",
        }),
        { status: 400 }
      );
    }

    if (!blogId || !Types.ObjectId.isValid(blogId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Parámetro 'blogId' inválido o ausente.",
        }),
        { status: 400 }
      );
    }

    await connect();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          message: "Usuario no existe en la base de datos.",
        }),
        { status: 400 }
      );
    }

    const blog = await Blog.findOne({ _id: blogId, user: userId });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({
          message: "La entrada no existe en la base de datos.",
        }),
        { status: 400 }
      );
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, description },
      { new: true }
    );

    return new NextResponse(
      JSON.stringify({
        message: "La entrada ha sido actualizada.",
        blog: updatedBlog,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Ocurrió un error actualizando la entrada." + error.message,
      {
        status: 500,
      }
    );
  }
};

export const DELETE = async (request: Request, context: { params: any }) => {
  const blogId = context.params.blog;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Parámetro 'userId' inválido o ausente.",
        }),
        { status: 400 }
      );
    }

    if (!blogId || !Types.ObjectId.isValid(blogId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Parámetro 'blogId' inválido o ausente.",
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
        {
          status: 400,
        }
      );
    }

    const blog = await Blog.findOne({ _id: blogId, user: userId });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({
          message: "Objeto 'blog' no se ha encontrado en la base de datos.",
        }),
        { status: 400 }
      );
    }

    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    return new NextResponse(
      JSON.stringify({
        message: "La categoría ha sido eliminada.",
        blog: deletedBlog,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Ocurrió un error eliminando la entrada." + error.message,
      {
        status: 500,
      }
    );
  }
};
