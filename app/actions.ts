"use server"

import { db } from "@/lib/db"

export async function getData() {
    return db.user.findMany({
        take: 5,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
        },
    })
}
