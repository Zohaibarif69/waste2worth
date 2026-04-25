import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { databaseUnavailableMessage, isDatabaseUnavailableError } from "@/lib/db-errors";

const handler = NextAuth(authOptions);

async function safeHandler(req: Request, context: any) {
	try {
		return await handler(req as any, context);
	} catch (error) {
		if (isDatabaseUnavailableError(error)) {
			return NextResponse.json({ error: databaseUnavailableMessage() }, { status: 503 });
		}
		throw error;
	}
}

export { safeHandler as GET, safeHandler as POST };
