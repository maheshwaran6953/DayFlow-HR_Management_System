import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage({
  params,
}: PageProps<"/profile/[employeeId]">) {
  const { employeeId } = await params;
  return <ProfileView employeeId={employeeId} />;
}
