import mongoose from "mongoose";


export const connect = async () => {
	const connection = mongoose.connection.readyState;

	if(connection === 1) {
		console.log("Connected...");
		return;
	}

	if(connection === 2) {
		console.log("Connecting...");
		return;
	}

	try{
		await mongoose.connect(process.env.MONGODB_URI, {
			dbName: "nextjsRestAPI",
			bufferCommands: true,
		});
		console.log("Connected...");

	}catch(err) {
		console.log(err);
		throw new Error(err);
	}
}







