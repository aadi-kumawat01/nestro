import ProfileDashboard from "@/components/website/profile-component/ProfileDashboard";

export const metadata = {
  title: "Profile",
  description: "Manage your Nestro profile, orders and settings.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <main className="flex-1 bg-[#fafaf9f7]">
      <ProfileDashboard />
    </main>
  );
}
