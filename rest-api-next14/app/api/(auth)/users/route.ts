import { NextResponse } from "next/server";
import { Types } from "mongoose";

import connect from "@/lib/db";
import User from "@/lib/models/user";

const ObjectId = require("mongoose").Types.ObjectId;

// Obtener usuarios
export const GET = async () => {
  try {
    await connect();
    const users = await User.find();

    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (error: any) {
    return new NextResponse("Error obteniendo los usuarios." + error.message, {
      status: 500,
    });
  }
};

// Crear usuarios
export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const newUser = new User(body);

    await connect();
    await newUser.save();

    return new NextResponse(
      JSON.stringify({ message: "El usuario ha sido creado.", user: newUser }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Hubo un error creando el usuario. " + error.message,
      { status: 500 }
    );
  }
};

// Actualizar usuarios
export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { userId, newUsername } = body;

    await connect();

    if (!userId || !newUsername) {
      return new NextResponse(
        JSON.stringify({
          message: "El ID del usuario o el nuevo nombre de usuario está vacío.",
        }),
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "El ID del usuario o nombre de usuario inválido.",
        }),
        { status: 400 }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { username: newUsername },
      { new: true }
    );

    if (!updatedUser) {
      return new NextResponse(
        JSON.stringify({
          message: "El usuario no ha sido encontrado en la base de datos.",
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "El usuario ha sido actualizado.",
        user: updatedUser,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Hubo un error actualizando al usuario. " + error.message,
      { status: 500 }
    );
  }
};

// Eliminar usuarios
export const DELETE = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse(
        JSON.stringify({
          message: "El ID del usuario no encontrado.",
        }),
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "El ID del usuario es inválido.",
        }),
        { status: 400 }
      );
    }

    await connect();

    const deletedUser = await User.findByIdAndDelete(
      new Types.ObjectId(userId)
    );

    if (!deletedUser) {
      return new NextResponse(
        JSON.stringify({
          message: "Usuario no encontrado en la base de datos.",
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "Usuario eliminado.", user: deletedUser }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Hubo un error eliminando al usuario. " + error.message,
      { status: 500 }
    );
  }
};
