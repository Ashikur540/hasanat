import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Building2, Users, ArrowRight, BookOpen, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const Index = () => {
  const { t } = useI18n();

  const features = [
    { icon: BarChart3, title: t("landingFeature1Title"), description: t("landingFeature1Desc") },
    { icon: Building2, title: t("landingFeature2Title"), description: t("landingFeature2Desc") },
    { icon: Users, title: t("landingFeature3Title"), description: t("landingFeature3Desc") },
  ];

  const steps = [
    { number: "01", icon: BookOpen, title: t("landingStep1Title"), description: t("landingStep1Desc") },
    { number: "02", icon: Star, title: t("landingStep2Title"), description: t("landingStep2Desc") },
    { number: "03", icon: Heart, title: t("landingStep3Title"), description: t("landingStep3Desc") },
  ];

  return (
    <div className="min-h-screen bg-background bg-gradient-mesh">
      <div className="fixed inset-0 bg-dot-pattern pointer-events-none opacity-40" />
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-foreground">{t("appName")}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild><Link to="/auth">{t("landingLogin")}</Link></Button>
            <Button asChild><Link to="/auth">{t("landingGetStarted")}</Link></Button>
          </div>
        </div>
      </motion.nav>

      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="container mx-auto px-4 text-center">
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="font-arabic text-2xl md:text-3xl text-primary mb-6">﷽</motion.p>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight mb-6 max-w-4xl mx-auto">
            {t("landingHeroTitle")}{" "}
            <span className="text-primary">{t("landingHeroHighlight")}</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t("landingHeroDesc")}
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 py-6" asChild>
              <Link to="/auth">{t("landingGetStartedFree")} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6" asChild>
              <a href="#features">{t("landingLearnMore")}</a>
            </Button>
          </motion.div>
        </motion.div>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            {t("landingFeaturesTitle")}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">
            {t("landingFeaturesSub")}
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-5">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold text-center text-foreground mb-14">
            {t("landingHowTitle")}
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {steps.map((s) => (
              <motion.div key={s.number} variants={fadeUp} transition={{ duration: 0.5 }} className="text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-5">
                  <s.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold text-primary tracking-wider">{t("landingStep")} {s.number}</span>
                <h3 className="text-xl font-semibold text-foreground mt-2 mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-2xl mx-auto bg-primary rounded-3xl p-10 md:p-14">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">{t("landingCtaTitle")}</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">{t("landingCtaDesc")}</p>
            <Button size="lg" variant="secondary" className="text-base px-8 py-6 font-semibold" asChild>
              <Link to="/auth">{t("landingCtaBtn")} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <span className="font-bold text-foreground">{t("appName")}</span>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-lg">{t("landingDisclaimer")}</p>
            <p className="text-sm text-muted-foreground">{t("landingCopyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
