import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

const ServerIdPage = () =>{
    return (
        <div>Server Id Page</div>
    );
}
  
 
export default ServerIdPage;