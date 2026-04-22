import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async (mongoUri) => {
	if (!mongoUri) {
		throw new Error('Missing MONGO_URI in backend/.env. Add your MongoDB Atlas connection string and restart the server.');
	}

	if (!/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
		throw new Error('Invalid MONGO_URI format. It must start with mongodb:// or mongodb+srv://');
	}

	if (mongoUri.startsWith('mongodb+srv://')) {
		const dnsServers = process.env.MONGODB_DNS_SERVERS
			?.split(',')
			.map((server) => server.trim())
			.filter(Boolean);

		dns.setServers(dnsServers?.length ? dnsServers : ['1.1.1.1', '8.8.8.8']);
	}

	await mongoose.connect(mongoUri);
	console.log('MongoDB connected');
};
