import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";

const handler = NextAuth(authOptions);

// Wrap handlers with error handling
const wrappedHandler = async (req: Request, context: any) => {
  try {
    return await handler(req, context);
  } catch (error) {
    return handleApiError(error);
  }
};

export { wrappedHandler as GET, wrappedHandler as POST };

