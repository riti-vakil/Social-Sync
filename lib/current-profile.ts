import { auth } from "@clerk/nextjs";

import { db } from "@/lib/db";

export const currentProfile = async () => {
  const { userId } = await auth();

  const isAuth = !!userId;

  if (!isAuth) {
    // console.log("null");
    return null;
  }

  const profile = await db.profile.findUnique({
    where: {
      userId
    }
  });

  return profile;
}