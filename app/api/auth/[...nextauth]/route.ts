import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function safeHandler(req: Request, context: any) {
	const [{ default: NextAuth }, { authOptions }, { databaseUnavailableMessage, isDatabaseUnavailableError }] =
		await Promise.all([
			import("next-auth"),
			import("@/lib/auth"),
			import("@/lib/db-errors"),
		]);

	const handler = NextAuth(authOptions);

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
