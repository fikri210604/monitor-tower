import { prisma } from "@/lib/prisma";

export type ActivityAction =
    | "IMPORT_EXCEL"
    | "CREATE_ASSET"
    | "UPDATE_ASSET"
    | "DELETE_ASSET"
    | "OTHER";

export async function logActivity(
    userId: string,
    action: ActivityAction,
    details: string | object
) {
    try {
        const detailsString = typeof details === "string"
            ? details
            : JSON.stringify(details);

        await prisma.activityLog.create({
            data: {
                userId,
                action,
                details: detailsString
            }
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw, we don't want to block the main action if logging fails
    }
}
