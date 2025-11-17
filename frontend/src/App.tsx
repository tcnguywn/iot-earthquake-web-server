import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { DashboardPage } from "./components/DashboardPage";
import { DevicesPage } from "./components/DevicesPage";
import { AlertsPage } from "./components/AlertsPage";
// import { StatisticsPage } from "./components/StatisticsPage"; // Xóa
import { SettingsPage } from "./components/SettingsPage";
import { Toaster } from "./components/ui/sonner";
import {
    ClerkProvider,
    SignedIn,
    SignedOut,
    SignIn,
    useAuth, // Thêm useAuth
} from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Vui lòng thêm VITE_CLERK_PUBLISHABLE_KEY vào file .env");
}

type Page = "dashboard" | "devices" | "alerts" | "settings";

// Interface cho API Stats
interface ApiStats {
    totalAlerts: number;
    high: number;
    moderate: number;
    low: number;
    unreadCount: number; // Đây là cái chúng ta cần
}

export default function App() {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <AppContent />
            <Toaster />
        </ClerkProvider>
    );
}

function AppContent() {
    return (
        <>
            <SignedIn>
                <MainApplication />
            </SignedIn>
            <SignedOut>
                <LoginPage />
            </SignedOut>
        </>
    );
}

function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            {/* Sử dụng giao diện tùy chỉnh của Clerk */}
            <SignIn routing="path" path="/" />
        </div>
    );
}

function MainApplication() {
    const [currentPage, setCurrentPage] = useState<Page>("dashboard");
    const [unreadAlerts, setUnreadAlerts] = useState(0); // State cho số thông báo
    const [isLoading, setIsLoading] = useState(true); // Thêm state loading
    const { getToken } = useAuth();

    // Hook để lấy Stats (bao gồm unreadCount)
    useEffect(() => {
        let isMounted = true;
        let intervalId: NodeJS.Timeout | null = null;

        const fetchStats = async () => {
            const token = await getToken();
            if (!token || !isMounted) return;

            try {
                const response = await fetch("http://localhost:5001/api/alerts/stats", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch stats");

                const stats: ApiStats = await response.json();

                if (isMounted) {
                    setUnreadAlerts(stats.unreadCount);
                }
            } catch (error) {
                console.error("Error fetching alert stats:", error);
                // Có thể toast lỗi ở đây nếu cần
            } finally {
                if (isMounted) setIsLoading(false); // Dừng loading khi xong
            }
        };

        fetchStats(); // Chạy lần đầu

        // Tự động cập nhật mỗi 30 giây
        intervalId = setInterval(fetchStats, 10000);

        // Cleanup
        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [getToken, currentPage]); // Chạy lại khi đổi trang (để đảm bảo)

    const handleNavigate = (page: string) => {
        setCurrentPage(page as Page);
        // Khi người dùng click vào trang Alerts, reset số thông báo về 0 (giả định)
        if (page === 'alerts') {
            setUnreadAlerts(0);
        }
    };

    // Hiển thị loading screen khi đang xác thực user và lấy data lần đầu
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar
                onNavigate={handleNavigate}
                currentPage={currentPage}
                unreadAlerts={unreadAlerts} // Truyền state động
            />
            <main>
                {currentPage === "dashboard" && <DashboardPage />}
                {currentPage === "devices" && <DevicesPage />}
                {currentPage === "alerts" && <AlertsPage />}
                {currentPage === "settings" && <SettingsPage />}
            </main>
        </div>
    );
}