import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  IndianRupee,
  Loader2,
  Lock,
  Smartphone,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Step = "login" | "dashboard" | "payment" | "waiting";

const MOBILE_REGEX = /^[6-9]\d{9}$/;
const UPI_ID = "8273333315@fam";

export default function UserSite() {
  const { actor } = useActor();
  const [step, setStep] = useState<Step>("login");
  const [name, setName] = useState("");
  const [inputName, setInputName] = useState("");
  const [age, setAge] = useState("");
  const [mobile, setMobile] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string>("waiting");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  const isMobileValid = MOBILE_REGEX.test(mobile);
  const isAgeValid = Number.parseInt(age) >= 18;

  const pollStatus = useCallback(async () => {
    if (!actor || !sessionId) return;
    try {
      const status = await actor.getPaymentStatus(sessionId);
      setPaymentStatus(status);
      if (status === "approved" || status === "rejected") {
        setPollingActive(false);
      }
    } catch (e) {
      console.error(e);
    }
  }, [actor, sessionId]);

  useEffect(() => {
    if (!pollingActive) return;
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [pollingActive, pollStatus]);

  const handleGoogleLogin = () => {
    if (!inputName.trim()) {
      toast.error("Please enter your name first");
      return;
    }
    setName(inputName.trim());
    setStep("dashboard");
    toast.success(`Welcome, ${inputName.trim()}! 🎉`);
  };

  const handleSubmitDetails = async () => {
    if (!actor) return;
    if (!name.trim() || !age || !isMobileValid || !isAgeValid) return;
    setIsSubmitting(true);
    try {
      const sid = await actor.submitUserDetails(
        name.trim(),
        BigInt(Number.parseInt(age)),
        mobile,
      );
      setSessionId(sid);
      setStep("payment");
      toast.success("Details saved! Proceed to payment.");
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimPayment = async () => {
    if (!actor || !sessionId) return;
    setIsClaiming(true);
    try {
      await actor.claimPayment(sessionId);
      setPaymentStatus("waiting");
      setPollingActive(true);
      setStep("waiting");
    } catch (e) {
      toast.error("Error submitting payment. Try again.");
      console.error(e);
    } finally {
      setIsClaiming(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success("UPI ID copied!");
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {step === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen earning-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden"
          >
            <div
              className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl"
              style={{ background: "oklch(0.7 0.2 290)" }}
            />
            <div
              className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl"
              style={{ background: "oklch(0.7 0.22 55)" }}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-center mb-10 relative z-10"
            >
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <TrendingUp className="w-4 h-4 text-yellow-300" />
                <span className="text-white/90 text-sm font-medium">
                  India's #1 Earning Platform
                </span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                Start Earning
                <span
                  className="block"
                  style={{ color: "oklch(0.85 0.22 55)" }}
                >
                  Today 💰
                </span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl max-w-md mx-auto">
                Join 50,000+ earners making real money from their smartphones
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full max-w-md relative z-10"
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-display text-center">
                    Create Your Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">
                      Your Full Name
                    </Label>
                    <Input
                      data-ocid="login.input"
                      placeholder="Enter your full name"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleGoogleLogin()
                      }
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/40 focus:border-white/60 h-12 text-base"
                    />
                  </div>
                  <Button
                    data-ocid="login.primary_button"
                    onClick={handleGoogleLogin}
                    className="w-full h-12 bg-white text-gray-800 hover:bg-gray-100 font-semibold text-base flex items-center gap-3 rounded-xl shadow-lg"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                      role="img"
                      aria-label="Google"
                    >
                      <title>Google</title>
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <p className="text-white/50 text-xs text-center">
                    By continuing, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex gap-8 text-center relative z-10"
            >
              {[
                { icon: "💰", label: "₹99 One-time", sub: "Unlock All" },
                { icon: "📱", label: "1 App", sub: "Earning App" },
                { icon: "⭐", label: "50,000+", sub: "Members" },
              ].map((item) => (
                <div key={item.label} className="text-white">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-white/60 text-xs">{item.sub}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {step === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-background"
          >
            {/* Hero Header */}
            <div className="earning-gradient py-10 px-6 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
                style={{ background: "oklch(0.85 0.22 55)" }}
              />
              <div className="max-w-3xl mx-auto relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30 text-xs">
                    <Star className="w-3 h-3 mr-1" /> Premium Member
                  </Badge>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                  Welcome, {name}! 👋
                </h1>
                <p className="text-white/70 text-base">
                  Your Earning Journey Starts Here
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    gradient: "stat-card-gradient-1",
                    icon: <Users className="w-6 h-6" />,
                    value: "50,000+",
                    label: "Total Earners",
                  },
                  {
                    gradient: "stat-card-gradient-2",
                    icon: <IndianRupee className="w-6 h-6" />,
                    value: "₹3,500",
                    label: "Avg Monthly",
                  },
                  {
                    gradient: "stat-card-gradient-3",
                    icon: <TrendingUp className="w-6 h-6" />,
                    value: "₹15,000",
                    label: "Top Earner/mo",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    data-ocid={`stat.card.${i + 1}` as any}
                    className={`${stat.gradient} rounded-2xl p-5 text-white`}
                  >
                    <div className="mb-2 opacity-80">{stat.icon}</div>
                    <div className="font-display text-2xl font-bold">
                      {stat.value}
                    </div>
                    <div className="text-white/70 text-sm mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Locked Earning App */}
              <div>
                <h2 className="font-display text-xl font-bold mb-4 text-foreground">
                  🔒 Your Earning App (Locked)
                </h2>
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="blur-sm p-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl mb-3">
                      🍄
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground">
                      Funngro
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Earn by completing tasks & sharing
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-green-400 text-sm font-medium">
                      <TrendingUp className="w-3 h-3" /> Earn ₹500–₹2,000/month
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Complete payment to unlock
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2 border-primary/20 card-glow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "oklch(0.68 0.2 290 / 0.15)" }}
                      >
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="font-display text-xl">
                          Fill Your Details to Unlock Access
                        </CardTitle>
                        <p className="text-muted-foreground text-sm mt-0.5">
                          One-time setup — takes 30 seconds
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="det-name">Full Name</Label>
                        <Input
                          id="det-name"
                          data-ocid="details.input"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="det-age">Age</Label>
                        <Input
                          id="det-age"
                          data-ocid="details.input"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="Must be 18+"
                          min={18}
                          max={100}
                          className="h-11"
                        />
                        {age && !isAgeValid && (
                          <p
                            data-ocid="details.error_state"
                            className="text-destructive text-xs"
                          >
                            Must be at least 18 years old
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="det-mobile">Mobile Number</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 bg-muted rounded-lg border border-input text-sm font-medium">
                          +91
                        </div>
                        <Input
                          id="det-mobile"
                          data-ocid="details.input"
                          type="tel"
                          value={mobile}
                          onChange={(e) =>
                            setMobile(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          className="h-11 flex-1"
                        />
                      </div>
                      {mobile && !isMobileValid && (
                        <p
                          data-ocid="details.error_state"
                          className="text-destructive text-xs flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Enter valid 10-digit
                          Indian mobile number (starts with 6,7,8,9)
                        </p>
                      )}
                      {mobile && isMobileValid && (
                        <p className="text-green-400 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Valid mobile
                          number
                        </p>
                      )}
                    </div>
                    <Button
                      data-ocid="details.submit_button"
                      onClick={handleSubmitDetails}
                      disabled={
                        !name.trim() ||
                        !isAgeValid ||
                        !isMobileValid ||
                        isSubmitting
                      }
                      className="w-full h-12 text-base font-semibold rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.68 0.2 290), oklch(0.55 0.2 280))",
                        color: "white",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" /> Get Access —
                          Pay ₹99
                        </>
                      )}
                    </Button>
                    <p className="text-muted-foreground text-xs text-center">
                      🔒 Secure one-time payment of ₹99 to unlock earning links
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <footer className="text-center py-6 text-muted-foreground text-xs">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                className="underline hover:text-foreground"
              >
                caffeine.ai
              </a>
            </footer>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen earning-gradient flex items-center justify-center p-6"
          >
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white">
              <CardHeader className="text-center pb-2">
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "oklch(0.85 0.22 55 / 0.2)" }}
                >
                  <IndianRupee
                    className="w-7 h-7"
                    style={{ color: "oklch(0.85 0.22 55)" }}
                  />
                </div>
                <CardTitle className="font-display text-2xl text-white">
                  One-Time Payment
                </CardTitle>
                <p className="text-white/70 text-sm mt-1">
                  Unlock Your Earning Links Forever
                </p>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                {/* UPI ID Display */}
                <div
                  className="rounded-xl p-5 border border-white/20"
                  style={{ background: "oklch(0.25 0.05 290 / 0.6)" }}
                >
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                    Pay to UPI ID
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-display text-2xl font-bold text-white tracking-wide">
                      {UPI_ID}
                    </span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      data-ocid="payment.secondary_button"
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      aria-label="Copy UPI ID"
                    >
                      <Copy className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                  <p className="text-white/50 text-xs mt-2">
                    Tap the copy icon to copy the UPI ID
                  </p>
                </div>

                <div>
                  <div
                    className="font-display text-4xl font-bold"
                    style={{ color: "oklch(0.85 0.22 55)" }}
                  >
                    ₹99
                  </div>
                  <p className="text-white/70 text-sm mt-1">
                    Pay this amount to unlock your Earning Link
                  </p>
                </div>

                <div className="text-left bg-white/5 rounded-xl p-4 space-y-2">
                  {[
                    "Open any UPI app (GPay, PhonePe, Paytm)",
                    `Send payment to UPI ID: ${UPI_ID}`,
                    "Pay exactly ₹99",
                    "Click 'I Have Paid' below",
                  ].map((instrStep, instrIdx) => (
                    <div
                      key={instrStep}
                      className="flex items-start gap-3 text-sm text-white/80"
                    >
                      <span
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                        style={{ background: "oklch(0.68 0.2 290)" }}
                      >
                        {instrIdx + 1}
                      </span>
                      {instrStep}
                    </div>
                  ))}
                </div>

                <Button
                  data-ocid="payment.primary_button"
                  onClick={handleClaimPayment}
                  disabled={isClaiming}
                  className="w-full h-13 text-base font-semibold rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.2 160), oklch(0.48 0.18 150))",
                    color: "white",
                  }}
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> I Have Paid ✓
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen earning-gradient flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md text-center">
              <AnimatePresence mode="wait">
                {paymentStatus === "waiting" && (
                  <motion.div
                    key="waiting-state"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    data-ocid="payment.loading_state"
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ background: "oklch(0.68 0.2 290 / 0.2)" }}
                    >
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-white mb-3">
                      Verifying Payment
                    </h2>
                    <p className="text-white/70 mb-2">
                      Verifying your payment... Please wait
                    </p>
                    <p className="text-white/50 text-sm">
                      This usually takes 1–2 minutes
                    </p>
                  </motion.div>
                )}

                {paymentStatus === "approved" && (
                  <motion.div
                    key="approved-state"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    data-ocid="payment.success_state"
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ background: "oklch(0.55 0.2 160 / 0.2)" }}
                    >
                      <CheckCircle2
                        className="w-10 h-10"
                        style={{ color: "oklch(0.75 0.2 160)" }}
                      />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-white mb-2">
                      Payment Approved! 🎉
                    </h2>
                    <p className="text-white/70 mb-8">
                      Your earning link is now unlocked!
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <a
                        href="https://refer.funngro.com/refer/K52HZE"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-ocid="earning.link.1"
                      >
                        <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors cursor-pointer group">
                          <CardContent className="p-5 flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                              style={{ background: "oklch(0.65 0.2 55 / 0.3)" }}
                            >
                              🍄
                            </div>
                            <div className="text-left">
                              <div className="font-display font-bold text-white text-lg">
                                Funngro
                              </div>
                              <div className="text-white/60 text-sm">
                                Earn by completing tasks & sharing
                              </div>
                              <div className="text-green-400 text-xs font-medium mt-1">
                                ↗ Open & Start Earning
                              </div>
                            </div>
                            <ArrowRight className="ml-auto text-white/40 group-hover:text-white/80 transition-colors" />
                          </CardContent>
                        </Card>
                      </a>
                    </div>
                  </motion.div>
                )}

                {paymentStatus === "rejected" && (
                  <motion.div
                    key="rejected-state"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    data-ocid="payment.error_state"
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ background: "oklch(0.55 0.22 25 / 0.2)" }}
                    >
                      <XCircle
                        className="w-10 h-10"
                        style={{ color: "oklch(0.7 0.22 25)" }}
                      />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-white mb-2">
                      Payment Not Confirmed
                    </h2>
                    <p className="text-white/70 mb-6">
                      Payment not confirmed. Please try again.
                    </p>
                    <Button
                      data-ocid="payment.secondary_button"
                      onClick={() => {
                        setPaymentStatus("waiting");
                        setStep("payment");
                      }}
                      className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 h-12 rounded-xl"
                    >
                      Try Again
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
