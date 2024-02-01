import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
 
export const initialProfile = async () => {
    const user = await currentUser();
    // console.log("user", user);
     
    if (!user) {
        return redirectToSignIn(); 
    }
 
    const existingProfile = await db.profile.findUnique({
        where: {
            userId: user.id,
        }
    });

    if (existingProfile) {
        return existingProfile;
    }

    const profileByEmail = await db.profile.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
        }
    });

    if (profileByEmail) {
        return profileByEmail;
    }

    const newProfile = await db.profile.create({
        data: {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
        }
    });

    return newProfile;
}
