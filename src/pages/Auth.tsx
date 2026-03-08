import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/I18nProvider";

const Auth = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <p className="font-arabic text-xl text-primary mb-2">﷽</p>
          <CardTitle className="text-2xl font-bold">{t("authWelcome")}</CardTitle>
          <CardDescription>{t("authSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("authEmail")}</Label>
            <Input type="email" placeholder="your@email.com" />
          </div>
          <div className="space-y-2">
            <Label>{t("authPassword")}</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full" asChild>
            <Link to="/dashboard">{t("authSignIn")}</Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            {t("authNoAccount")}{" "}
            <Link to="/auth" className="text-primary font-medium hover:underline">{t("authSignUp")}</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
