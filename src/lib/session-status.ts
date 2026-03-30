import { db } from "@/lib/db";

export async function expireOverdueSessions() {
  await db.session.updateMany({
    where: {
      status: "ACTIVE",
      expiryTime: {
        lte: new Date(),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });
}
