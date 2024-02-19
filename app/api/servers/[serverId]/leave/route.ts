import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const server = await db.server.findUnique({
        where: {
          id: params.serverId,
        },
      });
      
      if (!server) {
        throw new Error('Server not found');
      }
      
      if (server.profileId === profile.id) {
        throw new Error('Admin cannot leave the Server');
      }
            
      await db.server.update({
        where: {
          id: params.serverId,
        },
        data: {
          members: {
            deleteMany: {
              profileId: profile.id,
            },
          },
        },
      });
      
    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVER_ID_LEAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}