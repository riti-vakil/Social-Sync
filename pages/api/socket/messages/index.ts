import { NextApiRequest } from "next";

import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;
    
    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }    
  
    if (!serverId) {
      return res.status(400).json({ error: "Server ID missing" });
    }
      
    if (!channelId) {
      return res.status(400).json({ error: "Channel ID missing" });
    }
          
    if (!content) {
      return res.status(400).json({ error: "Content missing" });
    }


    // const server = await db.server.findFirst({
    //   where: {
    //     id: serverId as string,
    //     members: {
    //       some: {
    //         profileId: profile.id
    //       }
    //     }
    //   },
    //   include: {
    //     members: true,
    //   }
    // });

    const server = await db.server.findFirst({
      where: {
        id: serverId as string
      }
    });
    // console.log(server+"j1");
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const isMember = await db.member.findFirst({
      where: {
        serverId: server.id,
        profileId: profile.id
      }
    });
    // console.log(isMember+"j2");

    if (!isMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    const serverWithMembers = await db.server.findFirst({
      where: {
        id: serverId as string
      },
      include: {
        members: true
      }
    });

    // console.log(serverWithMembers+"j3");

    if (!serverWithMembers) {
      return res.status(404).json({ message: "Server not found" });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      }
    });
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // console.log(channel+"j4");

    const member = serverWithMembers.members.find((member) => member.profileId === profile.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    // console.log(member+"j5");

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channelId as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          }
        }
      }
    });
    // console.log(message+"j6");

    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" }); 
  }
}
