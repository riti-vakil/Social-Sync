import { PrismaClient } from "@prisma/client";

declare global{
    var prisma: PrismaClient | undefined;
};

export const db =globalThis.prisma || new PrismaClient;
// doent initialize new prisma client during every load during development
if(process.env.NODE_ENV !="production") globalThis.prisma=db
