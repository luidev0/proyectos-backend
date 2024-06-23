import { NextResponse } from "next/server";
import { Types } from "mongoose";

import connect from "@/lib/db";
import User from "@/lib/models/user";
import Category from "@/lib/models/category";

// Obtener Categorías
export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "ID inválido o no se pude encontrar en la base de datos.",
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

    const categories = await Category.find({
      user: new Types.ObjectId(userId),
    });

    return new NextResponse(JSON.stringify(categories), { status: 200 });
  } catch (error: any) {
    return new NextResponse(
      "Hubo un error listando las categorías del usuario. " + error.message,
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const { title } = await request.json();

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "ID inválido o no se pude encontrar en la base de datos.",
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

    const newCategory = new Category({
      title,
      user: new Types.ObjectId(userId),
    });

    await newCategory.save();

    return new NextResponse(
      JSON.stringify({
        message: "La categoría ha sido creada.",
        category: newCategory,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Hubo un error creando la categoría. " + error.message,
      { status: 500 }
    );
  }
};
