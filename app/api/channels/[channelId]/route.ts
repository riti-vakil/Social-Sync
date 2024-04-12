import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!params.channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }
    
    const hasPermission = await db.member.findFirst({
        where: {
        serverId: serverId,
        profileId: profile.id,
        role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] }
        }
    });
    
    if (!hasPermission) {
        console.error("User does not have permission to update the server.");
        return null;
    }
    
    const server = await db.channel.deleteMany({
        where: {
        id: params.channelId,
        name: { not: "general" }
        }
    });
    console.log(server);
    return new NextResponse("Channel deleted successfully", { status: 200 });
    
  } catch (error) {
    console.log("[CHANNEL_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
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

    if (!params.channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    const hasPermission = await db.member.findFirst({
        where: {
          serverId: serverId,
          profileId: profile.id,
          role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] }
        }
    });
      
    if (!hasPermission) {
      console.error("User does not have permission to update the server.");
      return null;
    }
    
    const server = await db.channel.update({
      where: {
        id: params.channelId,
        name: { not: "general" }
      },
      data: {
        name,
        type
      }
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log("[CHANNEL_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}