import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { appConfig } from "@/lib/config";

type MetadataValue = string | string[] | null | undefined;

function collectRoles(...values: MetadataValue[]) {
  return values.flatMap((value) => {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  });
}

export async function requireSuperAdmin() {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const publicMetadata = (user?.publicMetadata ?? {}) as Record<string, MetadataValue>;
  const privateMetadata = (user?.privateMetadata ?? {}) as Record<string, MetadataValue>;
  const claims = session.sessionClaims as Record<string, unknown>;
  const claimMetadata = (claims.metadata ?? {}) as Record<string, MetadataValue>;

  const roles = collectRoles(
    publicMetadata.role,
    publicMetadata.roles,
    privateMetadata.role,
    privateMetadata.roles,
    claimMetadata.role,
    claimMetadata.roles,
    claims.role as MetadataValue,
  );

  if (!roles.includes(appConfig.clerkSuperAdminRole)) {
    redirect("/unauthorized");
  }

  return {
    userId: session.userId,
    user,
  };
}
