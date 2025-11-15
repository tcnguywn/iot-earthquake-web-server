import { useState } from "react";
import { Navbar } from "./components/Navbar";
// import { LoginPage } from "./components/LoginPage";
import { DashboardPage } from "./components/DashboardPage";
import { DevicesPage } from "./components/DevicesPage";
import { AlertsPage } from "./components/AlertsPage";
import { StatisticsPage } from "./components/StatisticsPage";
import { SettingsPage } from "./components/SettingsPage";
import { Toaster } from "./components/ui/sonner";
import {
    ClerkProvider,
    SignedIn,
    SignedOut,
    SignIn,
} from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Vui lòng thêm VITE_CLERK_PUBLISHABLE_KEY vào file .env");
}

type Page = "dashboard" | "devices" | "alerts" | "statistics" | "settings";

export default function App() {
    return (
        // 4. Bọc toàn bộ ứng dụng trong <ClerkProvider>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <AppContent />
            <Toaster />
        </ClerkProvider>
    );
}

function AppContent() {
    return (
        <>
            {/* 5. Dùng <SignedIn> để hiển thị UI khi đã đăng nhập */}
            <SignedIn>
                <MainApplication />
            </SignedIn>

            {/* 6. Dùng <SignedOut> để hiển thị UI khi chưa đăng nhập */}
            <SignedOut>
                <LoginPage />
            </SignedOut>
        </>
    );
}

function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            {/* Component <SignIn> của Clerk sẽ xử lý toàn bộ logic đăng nhập,
        bao gồm cả việc gọi API backend và tự động "xác thực"
        cho <SignedIn> khi thành công.
      */}
            <SignIn />
        </div>
    );
}

function MainApplication() {
    const [currentPage, setCurrentPage] = useState<Page>("dashboard");

    const handleNavigate = (page: string) => {
        // 7. Logic điều hướng không cần xử lý 'login' nữa
        setCurrentPage(page as Page);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar
                onNavigate={handleNavigate}
                currentPage={currentPage}
                unreadAlerts={2}
                // 8. (Khuyến nghị) Thêm <UserButton> của Clerk vào Navbar
                // Nó sẽ tự động hiển thị avatar và nút đăng xuất.
                // Bạn sẽ cần sửa file components/Navbar.tsx để thêm component này.
                // Ví dụ: <div className="ml-auto"><UserButton afterSignOutUrl="/" /></div>
            />
            <main>
                {currentPage === "dashboard" && <DashboardPage />}
                {currentPage === "devices" && <DevicesPage />}
                {currentPage === "alerts" && <AlertsPage />}
                {currentPage === "statistics" && <StatisticsPage />}
                {currentPage === "settings" && <SettingsPage />}
            </main>
        </div>
    );
}
