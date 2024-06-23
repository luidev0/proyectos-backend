import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    console.log("Ya estás conectado a la base de datos.");
    return;
  }

  if (connectionState === 2) {
    console.log("Conectando...");
    return;
  }

  try {
    mongoose.connect(MONGODB_URI!, {
      dbName: "next14restapi",
      bufferCommands: true,
    });
    console.log("Conectado.");
  } catch (error: any) {
    console.log("Error:", error);
    throw new Error("Error:", error);
  }
};

export default connect;