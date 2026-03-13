import type { PaymentRecord } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import {
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSite() {
  const { actor } = useActor();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!actor) return;
    setIsRefreshing(true);
    try {
      const records = await actor.getPendingPayments();
      setPayments(records);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchPayments();
    const interval = setInterval(fetchPayments, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchPayments]);

  const handleLogin = async () => {
    if (!actor) return;
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const ok = await actor.adminLogin(password);
      if (ok) {
        setIsLoggedIn(true);
        toast.success("Welcome back, Admin!");
      } else {
        setLoginError("Wrong password. Please try again.");
      }
    } catch (e) {
      setLoginError("Login failed. Please try again.");
      console.error(e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    if (!actor) return;
    setActionLoading(id + (approved ? "approve" : "reject"));
    try {
      await actor.approvePayment(id, approved);
      toast.success(approved ? "Payment approved! ✅" : "Payment rejected.");
      await fetchPayments();
    } catch (e) {
      toast.error("Action failed. Please try again.");
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const waitingCount = payments.filter((p) => p.status === "waiting").length;
  const approvedCount = payments.filter((p) => p.status === "approved").length;
  const rejectedCount = payments.filter((p) => p.status === "rejected").length;

  const formatTime = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.1 0.02 285)" }}>
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <Card
              className="w-full max-w-sm"
              style={{
                background: "oklch(0.14 0.025 285)",
                borderColor: "oklch(0.25 0.04 285)",
              }}
            >
              <CardHeader className="text-center pb-4">
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "oklch(0.52 0.22 290 / 0.2)" }}
                >
                  <ShieldCheck
                    className="w-7 h-7"
                    style={{ color: "oklch(0.68 0.2 290)" }}
                  />
                </div>
                <CardTitle
                  className="font-display text-2xl"
                  style={{ color: "oklch(0.95 0.01 280)" }}
                >
                  Admin Dashboard
                </CardTitle>
                <p
                  className="text-sm mt-1"
                  style={{ color: "oklch(0.6 0.05 280)" }}
                >
                  Payment Approvals Panel
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label style={{ color: "oklch(0.7 0.05 280)" }}>
                    Password
                  </Label>
                  <Input
                    data-ocid="admin.input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Enter admin password"
                    className="h-11"
                    style={{
                      background: "oklch(0.18 0.03 285)",
                      borderColor: "oklch(0.28 0.04 285)",
                      color: "oklch(0.95 0.01 280)",
                    }}
                  />
                </div>
                {loginError && (
                  <p
                    data-ocid="admin.error_state"
                    className="text-sm flex items-center gap-1"
                    style={{ color: "oklch(0.7 0.22 25)" }}
                  >
                    <XCircle className="w-3 h-3" /> {loginError}
                  </p>
                )}
                <Button
                  data-ocid="admin.submit_button"
                  onClick={handleLogin}
                  disabled={!password || isLoggingIn}
                  className="w-full h-11 font-semibold"
                  style={{ background: "oklch(0.52 0.22 290)", color: "white" }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging
                      in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen"
          >
            {/* Header */}
            <div
              className="border-b px-6 py-4 flex items-center justify-between"
              style={{
                background: "oklch(0.14 0.025 285)",
                borderColor: "oklch(0.22 0.04 285)",
              }}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className="w-6 h-6"
                  style={{ color: "oklch(0.68 0.2 290)" }}
                />
                <span
                  className="font-display font-bold text-lg"
                  style={{ color: "oklch(0.95 0.01 280)" }}
                >
                  Payment Approvals Dashboard
                </span>
              </div>
              <Button
                data-ocid="admin.secondary_button"
                variant="outline"
                size="sm"
                onClick={fetchPayments}
                disabled={isRefreshing}
                style={{
                  borderColor: "oklch(0.28 0.04 285)",
                  color: "oklch(0.7 0.05 280)",
                  background: "transparent",
                }}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Waiting",
                    count: waitingCount,
                    icon: <Clock className="w-5 h-5" />,
                    color: "oklch(0.72 0.15 55)",
                  },
                  {
                    label: "Approved",
                    count: approvedCount,
                    icon: <CheckCircle2 className="w-5 h-5" />,
                    color: "oklch(0.65 0.18 160)",
                  },
                  {
                    label: "Rejected",
                    count: rejectedCount,
                    icon: <XCircle className="w-5 h-5" />,
                    color: "oklch(0.65 0.2 25)",
                  },
                ].map((stat) => (
                  <Card
                    key={stat.label}
                    style={{
                      background: "oklch(0.16 0.03 285)",
                      borderColor: "oklch(0.22 0.04 285)",
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div style={{ color: stat.color }}>{stat.icon}</div>
                      <div>
                        <div
                          className="font-display font-bold text-2xl"
                          style={{ color: "oklch(0.95 0.01 280)" }}
                        >
                          {stat.count}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.55 0.05 280)" }}
                        >
                          {stat.label}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Table */}
              <Card
                style={{
                  background: "oklch(0.14 0.025 285)",
                  borderColor: "oklch(0.22 0.04 285)",
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className="font-display text-lg flex items-center gap-2"
                    style={{ color: "oklch(0.95 0.01 280)" }}
                  >
                    <Users className="w-5 h-5" />
                    Payment Requests ({payments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {payments.length === 0 ? (
                    <div
                      data-ocid="admin.empty_state"
                      className="text-center py-16"
                    >
                      <Clock
                        className="w-10 h-10 mx-auto mb-3"
                        style={{ color: "oklch(0.4 0.05 280)" }}
                      />
                      <p
                        className="font-medium"
                        style={{ color: "oklch(0.6 0.05 280)" }}
                      >
                        No payment requests yet
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "oklch(0.45 0.04 280)" }}
                      >
                        Requests will appear here when users pay
                      </p>
                    </div>
                  ) : (
                    <div data-ocid="admin.table" className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow
                            style={{ borderColor: "oklch(0.22 0.04 285)" }}
                          >
                            {[
                              "#",
                              "Name",
                              "Age",
                              "Mobile",
                              "Status",
                              "Time",
                              "Actions",
                            ].map((h) => (
                              <TableHead
                                key={h}
                                style={{ color: "oklch(0.55 0.05 280)" }}
                              >
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((record, idx) => (
                            <TableRow
                              key={record.id.toString()}
                              data-ocid={`admin.row.${idx + 1}` as any}
                              style={{
                                borderColor: "oklch(0.2 0.03 285)",
                                background:
                                  record.status === "approved"
                                    ? "oklch(0.55 0.18 160 / 0.08)"
                                    : record.status === "rejected"
                                      ? "oklch(0.55 0.22 25 / 0.08)"
                                      : "transparent",
                              }}
                            >
                              <TableCell
                                style={{ color: "oklch(0.55 0.05 280)" }}
                                className="text-xs"
                              >
                                {idx + 1}
                              </TableCell>
                              <TableCell
                                className="font-medium"
                                style={{ color: "oklch(0.9 0.02 280)" }}
                              >
                                {record.name}
                              </TableCell>
                              <TableCell
                                style={{ color: "oklch(0.7 0.03 280)" }}
                              >
                                {record.age.toString()}
                              </TableCell>
                              <TableCell
                                style={{ color: "oklch(0.7 0.03 280)" }}
                              >
                                {record.mobile}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  style={{
                                    background:
                                      record.status === "approved"
                                        ? "oklch(0.55 0.18 160 / 0.2)"
                                        : record.status === "rejected"
                                          ? "oklch(0.55 0.22 25 / 0.2)"
                                          : "oklch(0.65 0.15 55 / 0.2)",
                                    color:
                                      record.status === "approved"
                                        ? "oklch(0.75 0.18 160)"
                                        : record.status === "rejected"
                                          ? "oklch(0.7 0.22 25)"
                                          : "oklch(0.75 0.15 55)",
                                    border: "none",
                                  }}
                                >
                                  {record.status === "approved" && (
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                  )}
                                  {record.status === "rejected" && (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {record.status === "waiting" && (
                                    <Clock className="w-3 h-3 mr-1" />
                                  )}
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell
                                className="text-xs"
                                style={{ color: "oklch(0.55 0.05 280)" }}
                              >
                                {formatTime(record.timestamp)}
                              </TableCell>
                              <TableCell>
                                {record.status === "waiting" && (
                                  <div className="flex gap-2">
                                    <Button
                                      data-ocid={
                                        `admin.confirm_button.${idx + 1}` as any
                                      }
                                      size="sm"
                                      onClick={() =>
                                        handleApprove(
                                          record.id.toString(),
                                          true,
                                        )
                                      }
                                      disabled={actionLoading !== null}
                                      className="h-7 text-xs px-2"
                                      style={{
                                        background:
                                          "oklch(0.55 0.18 160 / 0.2)",
                                        color: "oklch(0.75 0.18 160)",
                                        border: "none",
                                      }}
                                    >
                                      {actionLoading ===
                                      `${record.id.toString()}approve` ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        "✅ Approve"
                                      )}
                                    </Button>
                                    <Button
                                      data-ocid={
                                        `admin.delete_button.${idx + 1}` as any
                                      }
                                      size="sm"
                                      onClick={() =>
                                        handleApprove(
                                          record.id.toString(),
                                          false,
                                        )
                                      }
                                      disabled={actionLoading !== null}
                                      className="h-7 text-xs px-2"
                                      style={{
                                        background: "oklch(0.55 0.22 25 / 0.2)",
                                        color: "oklch(0.7 0.22 25)",
                                        border: "none",
                                      }}
                                    >
                                      {actionLoading ===
                                      `${record.id.toString()}reject` ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        "❌ Reject"
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <footer
              className="text-center py-6 text-xs"
              style={{ color: "oklch(0.4 0.04 280)" }}
            >
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                className="underline hover:opacity-80"
              >
                caffeine.ai
              </a>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
