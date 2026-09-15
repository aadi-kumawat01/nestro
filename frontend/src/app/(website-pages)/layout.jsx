import Header from "@/components/website/HFcomponents/Header";
import Footer from "@/components/website/HFcomponents/Footer";
import MobileBottomNav from "@/components/website/HFcomponents/MobileBottomNav";
export default function WebsiteLayout({ children }) {
  return (
    <div className="pt-14 lg:pt-16 min-h-screen flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Header />
      <main className="w-full flex-1 bg-[#efece6]">
        <div className="w-full max-w-[1580px] mx-auto">{children}</div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
