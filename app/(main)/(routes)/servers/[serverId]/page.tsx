import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface ServerIdPageProps {
  params: {
    serverId: string;
  }
};

const ServerIdPage = async ({
  params
}: ServerIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

//   const server = await db.server.findUnique({
//     where: {
//       id: params.serverId,
//       members: {
//         some: {
//           profileId: profile.id,
//         }
//       }
//     },
//     include: {
//       channels: {
//         where: {
//           name: "general"
//         },
//         orderBy: {
//           createdAt: "asc"
//         }
//       }
//     }
//   })

    const existingServer = await db.server.findFirst({
        where: {
            id: params.serverId,
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
    if(existingServer && isMember){
        
        const server = await db.server.findUnique({
            where: {
            id: params.serverId,
            },
            include: {
            channels: {
                where: {
                name: "general"
                },
                orderBy: {
                createdAt: "asc"
                }
            }
            }
        })
        // console.log(server+"HO")
        const initialChannel = server?.channels[0];
    
        if (initialChannel?.name !== "general") {
        return null;
        }
    
        return redirect(`/servers/${existingServer.id}/channels/${initialChannel?.id}`)
    }
}
 
export default ServerIdPage;