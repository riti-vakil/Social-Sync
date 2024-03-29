import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import { InitialModal } from "@/components/modals/initial-modal";

const SetupPage = async () => {
  const profile = await initialProfile();

  const member = await db.member.findFirst({
    where: {
      profileId: profile.id
    }
  });

  if (member) {
    const server = await db.server.findUnique({
      where: {
        id: member.serverId
      }
    });
    if (server) {
      return redirect(`/servers/${server.id}`);
    }
  }

  return <InitialModal />;
}
 
export default SetupPage;
