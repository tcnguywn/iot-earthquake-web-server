import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Loader2, Save } from "lucide-react";

interface ApiUser {
    _id: string;
    clerkId: string;
    email: string;
    telegramChatId?: string | null;
    createdAt: string;
}

export function SettingsPage() {
    const [telegramId, setTelegramId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { getToken } = useAuth();

    // 1. Tải dữ liệu user (Đã đúng)
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

    // 2. Hàm để lưu (SỬA LẠI API ENDPOINT VÀ METHOD)
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Chưa xác thực");

            const response = await fetch("http://localhost:5001/api/user/telegram", { // Sửa URL
                method: "PUT", // Sửa Method
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    telegramChatId: telegramId,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Lỗi khi lưu");
            }

            toast.success(result.message);
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
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    // 3. Giao diện JSX (Không đổi)
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-500">Manage your account settings</p>
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Telegram Notifications</h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="telegram-id">Telegram Chat ID</Label>
                        <Input
                            id="telegram-id"
                            placeholder="Enter your Telegram Chat ID"
                            value={telegramId || ''} // Đảm bảo value không phải là null
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
        </div>
    );
}