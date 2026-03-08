import { useI18n } from "@/i18n/I18nProvider";

const Ramadan = () => {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("ramadanTitle")}</h1>
      <p className="text-muted-foreground mt-1">{t("ramadanSub")}</p>
    </div>
  );
};
export default Ramadan;
