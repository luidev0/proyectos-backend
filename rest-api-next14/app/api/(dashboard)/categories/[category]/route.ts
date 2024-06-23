import { NextResponse } from "next/server";
import { Types } from "mongoose";

import connect from "@/lib/db";
import User from "@/lib/models/user";
import Category from "@/lib/models/category";

export const PATCH = async (request: Request, context: { params: any }) => {
  const categoryId = context.params.category;

  try {
    const body = await request.json();
    const { title } = body;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "ID de usuario inválido.",
        }),
        { status: 400 }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({
          message: "ID de categoría inválido.",
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

    const category = await Category.findOne({ _id: categoryId, user: userId });

    if (!category) {
      return new NextResponse(
        JSON.stringify({
          message: "La categoría no existe en la base de datos.",
        }),
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { title },
      { new: true }
    );

    return new NextResponse(
      JSON.stringify({
        message: "Categoria actualizada.",
        category: updatedCategory,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse("Error in updating category" + error.message, {
      status: 500,
    });
  }
};

export const DELETE = async (request: Request, context: { params: any }) => {
  const categoryId = context.params.category;

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

    const category = await Category.findOne({ _id: categoryId, user: userId });

    if (!category) {
      return new NextResponse(
        JSON.stringify({
          message: "Objeto 'category' no se ha encontrado en la base de datos.",
        }),
        { status: 400 }
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    return new NextResponse(
      JSON.stringify({
        message: "La categoría ha sido eliminada.",
        category: deletedCategory,
      }),
      { status: 200 }
    );
  } catch (error: any) {}
};
