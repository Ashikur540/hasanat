import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { CloudFog, CalendarX, Eye, Activity } from "lucide-react";
import { fadeUp, stagger } from "../animations";

const SpiritualGapSection = () => {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const last5Days = [
    { points: 8 },
    { points: 18 },
    { points: 24 },
    { points: 35 },
    { points: 42 },
  ];

  return (
    <section id="spiritual-gap" aria-label="Spiritual Gap" className="py-24 relative z-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm md:text-base tracking-[0.18em] uppercase font-semibold text-primary dark:text-emerald-custom"
          >
            Why Hasanat Exists
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-6 text-4xl md:text-6xl font-bold text-foreground dark:text-white font-serif"
          >
            Does This Sound Familiar?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-lg md:text-2xl text-muted-foreground dark:text-gray-400 leading-relaxed"
          >
            Every Muslim knows this feeling. We built Hasanat because
            <br className="hidden md:block" /> we lived it too.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={`grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border shadow-xl ${
              theme === "dark" ? "border-stone-800" : "border-stone-200"
            }`}
          >
            <div
              className={`p-8 md:p-10 relative group ${
                theme === "dark"
                  ? "bg-stone-900/40 backdrop-blur-sm"
                  : "bg-stone-100/50"
              }`}
            >
              <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay" />
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 ${
                    theme === "dark"
                      ? "bg-stone-800 border-stone-700"
                      : "bg-white border-stone-300"
                  }`}
                >
                  <CloudFog
                    className={`w-6 h-6 ${theme === "dark" ? "text-stone-500" : "text-stone-400"}`}
                  />
                </div>
                <h2
                  className={`text-2xl md:text-3xl font-bold mb-4 leading-tight ${
                    theme === "dark" ? "text-stone-300" : "text-stone-700"
                  }`}
                >
                  The Noise of{" "}
                  <span className={`${theme === "dark" ? "text-stone-500" : "text-stone-500"} italic`}>
                    Dunya
                  </span>
                </h2>
                <p
                  className={`text-base leading-relaxed mb-6 ${
                    theme === "dark" ? "text-stone-400" : "text-stone-600"
                  }`}
                >
                  Every Muslim knows this feeling: we intend to pray five salah, read Quran, and
                  stay consistent, but the day slips away.
                </p>

                <ul
                  className={`space-y-2 mb-8 ${theme === "dark" ? "text-stone-400" : "text-stone-600"}`}
                >
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>You meant to pray Fajr, got distracted, and another day passed</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>No record of your progress means no clear visibility of growth</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>Guilt after missing days makes restarting feel heavier than it should</span>
                  </li>
                </ul>

                <div
                  className={`border rounded-xl p-5 opacity-60 grayscale blur-[1px] group-hover:blur-none transition-all duration-500 ${
                    theme === "dark"
                      ? "border-stone-800 bg-stone-950/50"
                      : "border-stone-300 bg-stone-200/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4 opacity-50">
                    <CalendarX
                      className={`w-5 h-5 ${theme === "dark" ? "text-stone-500" : "text-stone-400"}`}
                    />
                    <span
                      className={`text-sm ${theme === "dark" ? "text-stone-500" : "text-stone-400"}`}
                    >
                      Empty Record
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={`empty-cell-${i}`}
                        className={`w-6 h-6 rounded ${theme === "dark" ? "bg-stone-800" : "bg-stone-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-8 md:p-10 relative overflow-hidden ring-1 ring-inset ${
                theme === "dark"
                  ? "bg-gradient-to-br from-[#0a1b14] to-stone-900 ring-emerald-500/30"
                  : "bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white ring-emerald-400/40"
              }`}
            >
              <div
                className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] ${
                  theme === "dark" ? "bg-emerald-500/10" : "bg-emerald-400/20"
                }`}
              />
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-emerald-500/20 border-emerald-500/40 shadow-emerald-500/20"
                      : "bg-emerald-100 border-emerald-400/50 shadow-emerald-200/50"
                  }`}
                >
                  <Eye className={`w-6 h-6 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`} />
                </div>
                <h2
                  className={`text-2xl md:text-3xl font-bold mb-4 leading-tight ${
                    theme === "dark" ? "text-white" : "text-stone-800"
                  }`}
                >
                  The Mirror of the{" "}
                  <span
                    className={`drop-shadow-lg ${
                      theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    Soul
                  </span>
                </h2>
                <p
                  className={`text-base leading-relaxed mb-6 ${
                    theme === "dark" ? "text-stone-300" : "text-stone-700"
                  }`}
                >
                  AmalTrack makes the invisible record visible. It helps you bridge the gap
                  between intentions and actions.
                </p>

                <ul
                  className={`space-y-2 mb-8 ${theme === "dark" ? "text-stone-300" : "text-stone-700"}`}
                >
                  <li className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}
                    >
                      ✓
                    </span>
                    <span>Daily deed checklist keeps salah, Quran, and sadaqah in front of you</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}
                    >
                      ✓
                    </span>
                    <span>Amal Graph helps you see every good entry and where consistency forms</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}
                    >
                      ✓
                    </span>
                    <span>Momentum builds when each deed is logged and visible over time</span>
                  </li>
                </ul>

                <div
                  className={`border rounded-xl p-5 backdrop-blur-md relative shadow-xl ${
                    theme === "dark"
                      ? "border-emerald-500/30 bg-stone-900/80 shadow-emerald-500/10"
                      : "border-emerald-400/40 bg-white/90 shadow-emerald-300/30"
                  }`}
                >
                  <div
                    className={`absolute -inset-0.5 rounded-xl blur opacity-50 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0"
                        : "bg-gradient-to-r from-emerald-400/0 via-emerald-400/30 to-emerald-400/0"
                    }`}
                  />
                  <div className="relative flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Activity
                        className={`w-5 h-5 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-white" : "text-stone-800"
                        }`}
                      >
                        Consistent Action
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        theme === "dark"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-emerald-700 bg-emerald-100"
                      }`}
                    >
                      Live
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {last5Days.map((day, i) => {
                      const opacity = day.points > 0 ? Math.min(day.points / 50 + 0.2, 1) : 0.1;
                      return (
                        <div
                          key={`active-cell-${i}`}
                          className={theme === "dark" ? "bg-emerald-500" : "bg-emerald-600"}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "4px",
                            opacity,
                            boxShadow:
                              opacity > 0.6
                                ? theme === "dark"
                                  ? "0 0 12px rgba(16, 185, 129, 0.6)"
                                  : "0 0 10px rgba(5, 150, 105, 0.4)"
                                : "none",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SpiritualGapSection;
