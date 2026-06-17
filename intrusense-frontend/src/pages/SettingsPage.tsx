import { useEffect, useState } from 'react';
import { Eye, EyeOff, ExternalLink, RefreshCw, Copy, Check, X } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import notify from '@/utils/notify';
import * as telegramApi from '@/services/telegram';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const { status, loading, updatingSettings, fetchStatus, updateSettings, toggleArmed } =
    useSettings();
  const { admin, updateProfile, updatingProfile } = useAuth();

  const [form, setForm] = useState<Pick<Settings, 'distanceThresholdCm' | 'alertCooldownMs'>>({
    distanceThresholdCm: 150,
    alertCooldownMs: 60000,
  });

  const [accountForm, setAccountForm] = useState({
    username: '',
    telegramChatId: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showLinkFlow, setShowLinkFlow] = useState(false);

  useEffect(() => {
    telegramApi
      .getBotInfo()
      .then((res) => {
        setBotUsername(res.data.data.botUsername);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status) {
      setForm({
        distanceThresholdCm: status.settings.distanceThresholdCm,
        alertCooldownMs: status.settings.alertCooldownMs,
      });
    }
  }, [status]);

  useEffect(() => {
    if (admin) {
      setAccountForm((f) => ({
        ...f,
        username: admin.username,
        telegramChatId: admin.telegramChatId ?? '',
      }));
    }
  }, [admin]);

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    const payload: { username?: string; telegramChatId?: string; password?: string } = {};
    if (accountForm.username && accountForm.username !== admin?.username) {
      payload.username = accountForm.username;
    }
    if (accountForm.telegramChatId !== (admin?.telegramChatId ?? '')) {
      payload.telegramChatId = accountForm.telegramChatId;
    }
    if (accountForm.newPassword) {
      payload.password = accountForm.newPassword;
    }

    if (Object.keys(payload).length === 0) {
      notify.error('No changes to save');
      return;
    }

    await updateProfile(payload);
    setAccountForm((f) => ({ ...f, newPassword: '', confirmPassword: '' }));
  };

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const res = await telegramApi.requestVerifyCode();
      setVerifyCode(res.data.data.code);
      setCodeCopied(false);
    } catch {
      notify.error('Failed to generate code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!verifyCode) return;
    navigator.clipboard.writeText(verifyCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleConfirmCode = async () => {
    setVerifying(true);
    try {
      const res = await telegramApi.confirmVerifyCode();
      const { chatId } = res.data.data;
      setAccountForm((f) => ({ ...f, telegramChatId: chatId }));
      setVerifyCode(null);
      setShowLinkFlow(false);
      notify.success('Telegram linked — save your account to apply');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Verification failed';
      notify.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const armed = status?.settings.armed;

  return (
    <div className="space-y-6 max-w-xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">System configuration</p>
      </div>

      {/* Arm state */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-200">Arm System</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {armed ? 'System is actively monitoring' : 'System is inactive — no alerts will fire'}
            </p>
          </div>
          <button
            onClick={toggleArmed}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${
              armed ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={armed}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                armed ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Detection settings */}
      <form
        onSubmit={handleUpdateSettings}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5"
      >
        <h2 className="text-sm font-semibold text-slate-200">Detection</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Distance Threshold</label>
          <p className="text-xs text-slate-500">
            Object closer than this distance triggers an intrusion (when armed + PIR active)
          </p>
          <div className="relative mt-2">
            <input
              type="number"
              min={10}
              max={500}
              value={form.distanceThresholdCm}
              onChange={(e) =>
                setForm((f) => ({ ...f, distanceThresholdCm: Number(e.target.value) }))
              }
              className="w-full px-3.5 py-2.5 pr-12 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              cm
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Alert Cooldown</label>
          <p className="text-xs text-slate-500">
            Minimum time between Telegram alerts for repeated intrusions
          </p>
          <div className="relative mt-2">
            <input
              type="number"
              min={1000}
              step={1000}
              value={form.alertCooldownMs}
              onChange={(e) => setForm((f) => ({ ...f, alertCooldownMs: Number(e.target.value) }))}
              className="w-full px-3.5 py-2.5 pr-12 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              ms
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {form.alertCooldownMs >= 1000 ? `= ${(form.alertCooldownMs / 1000).toFixed(0)}s` : ''}
          </p>
        </div>

        <button
          type="submit"
          disabled={updatingSettings || loading}
          className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {updatingSettings ? 'Updating…' : 'Update settings'}
        </button>
      </form>

      {/* Account */}
      <form
        onSubmit={handleSaveAccount}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5"
      >
        <h2 className="text-sm font-semibold text-slate-200">Account</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Username</label>
          <input
            type="text"
            value={accountForm.username}
            onChange={(e) => setAccountForm((f) => ({ ...f, username: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Telegram Notifications
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Receive intrusion alerts directly on Telegram.
            </p>
          </div>

          {/* Current link status */}
          {accountForm.telegramChatId ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-200">Linked</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
              <span className="text-sm text-slate-500">Not linked</span>
            </div>
          )}

          {/* Toggle button — only shown when flow is closed */}
          {!showLinkFlow && (
            <button
              type="button"
              onClick={() => setShowLinkFlow(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {accountForm.telegramChatId ? '+ Link to another account' : '+ Link account'}
            </button>
          )}

          {/* Collapsible link flow */}
          {showLinkFlow && (
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/60 p-4 space-y-5">
              {/* Panel header with close */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Link Telegram account
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setVerifyCode(null);
                    setShowLinkFlow(false);
                  }}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Step 1 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Step 1 — Generate a code
                </p>
                {!verifyCode ? (
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={generatingCode}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    <RefreshCw size={14} className={generatingCode ? 'animate-spin' : ''} />
                    {generatingCode ? 'Generating…' : 'Generate code'}
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-slate-700/60 border border-indigo-500/40">
                    <span className="font-mono text-xl font-bold tracking-widest text-indigo-300">
                      {verifyCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy code"
                    >
                      {codeCopied ? (
                        <Check size={16} className="text-emerald-400" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Step 2 — Send it to your bot
                </p>
                <p className="text-xs text-slate-500">
                  Open your bot on Telegram and send the code as a message. It expires in 5 minutes.
                </p>
                {botUsername && (
                  <a
                    href={`https://t.me/${botUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 text-sm font-medium transition-colors"
                  >
                    <ExternalLink size={14} />
                    Open @{botUsername}
                  </a>
                )}
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Step 3 — Verify
                </p>
                <p className="text-xs text-slate-500">
                  Once you've sent the code, click below. We'll detect your message and link your
                  account automatically.
                </p>
                <button
                  type="button"
                  onClick={handleConfirmCode}
                  disabled={verifying || !verifyCode}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  <RefreshCw size={14} className={verifying ? 'animate-spin' : ''} />
                  {verifying ? 'Verifying…' : "I've sent it — Verify"}
                </button>
              </div>

              <p className="text-xs text-slate-600">
                You can repeat this process anytime to link a different Telegram account.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">New Password</label>
          <p className="text-xs text-slate-500">Leave blank to keep your current password.</p>
          <div className="relative mt-2">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={accountForm.newPassword}
              onChange={(e) => setAccountForm((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {accountForm.newPassword && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Confirm New Password</label>
            <input
              type="password"
              value={accountForm.confirmPassword}
              onChange={(e) => setAccountForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={updatingProfile}
          className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {updatingProfile ? 'Updating…' : 'Update account'}
        </button>
      </form>
    </div>
  );
}
