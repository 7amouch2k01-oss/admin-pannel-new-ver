import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Lock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export default function Unauthorized() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignInAsAdmin = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      // Ignore logout errors, proceed to login page
    }
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 max-w-md w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-destructive/10 rounded-lg">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">
            {t("unauthorized.title")}
          </h1>
          <p className="text-base text-muted-foreground text-center">
            {t("unauthorized.desc")}
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.history.back()}
            disabled={isLoggingOut}
          >
            {t("unauthorized.goBack")}
          </Button>
          <Button
            className="flex-1"
            onClick={handleSignInAsAdmin}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? t("unauthorized.loading") : t("unauthorized.signInAdmin")}
          </Button>
        </div>
      </div>
    </div>
  );
}
