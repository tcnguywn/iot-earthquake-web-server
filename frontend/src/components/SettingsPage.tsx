import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react"; // Dùng để lấy token
import { toast } from "sonner"; // Dùng để thông báo
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Loader2, Save } from "lucide-react";

// Interface cho dữ liệu User từ API (BE của bạn)
interface ApiUser {
    _id: string;
    clerkId: string;
    email: string;
    telegramChatId?: string | null; // Có thể là null
    createdAt: string;
}

export function SettingsPage() {
    const [telegramId, setTelegramId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { getToken } = useAuth();

    // 1. Tải dữ liệu user hiện tại khi mở trang
    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            try {
                const token = await getToken();
                if (!token) throw new Error("Chưa xác thực");

                const response = await fetch("http://localhost:5001/api/user", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Không thể tải hồ sơ");

                const user: ApiUser = await response.json();

                // Cập nhật state với dữ liệu từ DB
                if (user.telegramChatId) {
                    setTelegramId(user.telegramChatId);
                }

            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [getToken]);

    // 2. Hàm để lưu (gọi API PATCH)
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Chưa xác thực");

            const response = await fetch("http://localhost:5001/api/user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    telegramChatId: telegramId, // Gửi dữ liệu mới
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Lỗi khi lưu");
            }

            toast.success(result.message);
            // Cập nhật lại state (nếu cần)
            if (result.user) {
                setTelegramId(result.user.telegramChatId);
            }

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    // 3. Giao diện JSX
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-500">Manage your account settings</p>
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="telegram-id">Telegram Chat ID</Label>
                        <Input
                            id="telegram-id"
                            placeholder="Enter your Telegram Chat ID"
                            value={telegramId}
                            onChange={(e) => setTelegramId(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                            This ID is used to send you alert notifications via Telegram.
                        </p>
                    </div>

                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </Card>

            {/*<Card className="p-6 mt-8">*/}
            {/*    <h2 className="text-lg font-semibold mb-4">Clerk Account</h2>*/}
            {/*    <p className="text-sm text-gray-600 mb-4">*/}
            {/*        To manage your core account details (like email or password),*/}
            {/*        please use the integrated Clerk management page.*/}
            {/*    </p>*/}
            {/*    <p className="text-sm text-gray-600">*/}
            {/*        (Bạn có thể chèn component <strong>&lt;UserProfile /&gt;</strong> của Clerk vào đây nếu muốn,*/}
            {/*        nhưng nó sẽ tách biệt với form Telegram ở trên.)*/}
            {/*    </p>*/}
            {/*</Card>*/}
        </div>
    );
}