import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { ServerSideBar } from "@/components/server/server-sidebar";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const ServerIdLayout = async ({
    children,
    params,
} : {
     children: React.ReactNode;
     params: { serverId : string};  
}) =>{
    const profile = await currentProfile();
    
    if(!profile){
        return redirectToSignIn();
    }

    const membership = await db.member.findFirst({
        where: {
          profileId: profile.id,
          serverId: params.serverId, 
        },
    });
    if(membership){
        const server = await db.server.findFirst({
            where: {
              id: membership.serverId,
            },
            include: {
              members: true, 
            },
          });
        if(!server){
            return redirect("/");
        }
      
        return ( 
            <div className="h-full">
            <div 
            className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSideBar serverId={params.serverId}/>
            </div>
            <main className="h-full md:pl-60">
                {children}
            </main>
            </div>
        );
    }
    
}

export default ServerIdLayout
// const server = await db.server.findFirst({
    //     where: {
    //       AND: [
    //         { id: params.serverId },
    //         {
    //           members: {
    //             some: {
    //               profileId: profile.id
    //             }
    //           }
    //         }
    //       ]
    //     },
    //     include: {
    //       members: true 
    //     }
    // });
/*const isMember = await db.member.findFirst({
        where: {
          serverId: params.serverId,
          profileId: profile.id,
        },
      });

    const server = await db.server.findFirst({
        where: { id: params.serverId },
        include: {
          members: true,
        },
      });*/