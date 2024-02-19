import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(
  req: Request
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    // const server = await db.server.update({
    //   where: {
    //     id: serverId,
    //     members: {
    //       some: {
    //         profileId: profile.id,
    //         role: {
    //           in: [MemberRole.ADMIN, MemberRole.MODERATOR]
    //         }
    //       }
    //     }
    //   },
    //   data: {
    //     channels: {
    //       create: {
    //         profileId: profile.id,
    //         name,
    //         type,
    //       }
    //     }
    //   }
    // });
    const member = await db.member.findFirst({
        where: {
          serverId: serverId,
          profileId: profile.id,
          role: {
            in: [MemberRole.ADMIN, MemberRole.MODERATOR],
          },
        },
      });
      
      if (!member) {
        console.error("User does not have permission to update the server.");
        return null;
    }
    if (member) {
        const server = await db.server.update({
          where: {
            id: serverId,
          },
          data: {
            channels: {
              create: {
                profileId: profile.id,
                name,
                type,
              },
            },
          },
        });
      
        console.log(server);
        return NextResponse.json(server);
      }


    
  } catch (error) {
    console.log("CHANNELS_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}