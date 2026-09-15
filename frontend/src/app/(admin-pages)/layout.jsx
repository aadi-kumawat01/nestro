export const dynamic = "force-dynamic";
import styles from "@/components/admin/AdminUI.module.css";
import Adminaside from "@/components/admin/Adminaside";
import Header from "@/components/admin/Header";
import { requireAdmin } from "@/api/server";
export const metadata = {
  title: "Store administration",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({ children }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-[#faf8f4] flex">
      <Adminaside />
      <div className="min-w-0 flex-1">
        <Header />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
