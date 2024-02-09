import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface InviteCodePageProps{
    params: {
        inviteCode: string;
    };
};

const InviteCodePage = async ({
    params
}: InviteCodePageProps) => {

    const profile= await currentProfile();
    if(!profile){
        return redirectToSignIn();
    }
    if(!params.inviteCode){
        return redirect("/");
    }

    // const existingServer= await db.server.findFirst({
    //     where: {
    //         inviteCode: params.inviteCode,
    //         members: {
    //             some: {
    //                 profileId: profile.id
    //             }
    //         }
    //     }
    // });

    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
        },
    });

    let isMember = false;
    if (existingServer) {
        const member = await db.member.findFirst({
            where: {
                serverId: existingServer.id,
                profileId: profile.id,
            },
        });
        isMember = !!member;
    }

    if (existingServer && isMember) {
        return redirect(`/servers/${existingServer.id}`); 
    } 
    
    const server = await db.server.findFirst({
        where: {
          inviteCode: params.inviteCode,
        },
      });
      
    if (server) {
        const updatedServer = await db.server.update({
          where: {
            id: server.id,
          },
          data: {
            members: {
              create: [
                {
                  profileId: profile.id,
                },
              ],
            },
          },
        });
        if (updatedServer) {
            return redirect(`/servers/${server.id}`);
        }
    }
}
export default InviteCodePage;
