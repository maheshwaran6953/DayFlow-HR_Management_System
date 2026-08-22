import { ProfileView } from "@/components/profile/profile-view";

export default function ProfilePage({
  params,
}: {
  params: { employeeId: string };
}) {
  return <ProfileView employeeId={params.employeeId} />;
}
