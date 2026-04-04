import { useState, useEffect } from 'react'

interface SSOConfigData {
  provider: 'okta' | 'azure_ad' | 'google_workspace' | 'custom_saml'
  entityId: string
  ssoUrl: string
  certificate: string
  status: 'not_configured' | 'configured' | 'active'
}

interface SSOConfigProps {
  requireEnterprise?: boolean
}

const PROVIDERS: { value: SSOConfigData['provider']; label: string }[] = [
  { value: 'okta', label: 'Okta' },
  { value: 'azure_ad', label: 'Azure AD' },
  { value: 'google_workspace', label: 'Google Workspace' },
  { value: 'custom_saml', label: 'Custom SAML' }
]

const statusColors: Record<SSOConfigData['status'], { bg: string; text: string; label: string }> = {
  not_configured: { bg: 'bg-slate-700/30', text: 'text-slate-400', label: 'Not Configured' },
  configured: { bg: 'bg-[#f97316]/10', text: 'text-[#f97316]', label: 'Configured' },
  active: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]', label: 'Active' }
}

export default function SSOConfig({ requireEnterprise }: SSOConfigProps): JSX.Element {
  const [config, setConfig] = useState<SSOConfigData>({
    provider: 'okta',
    entityId: '',
    ssoUrl: '',
    certificate: '',
    status: 'not_configured'
  })
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.streamSync.getSSOConfig().then((c) => {
      if (c) setConfig(c)
      setLoading(false)
    })
  }, [])

  if (requireEnterprise) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-slate-400 text-sm">SSO Configuration requires an Enterprise plan.</p>
        </div>
      </div>
    )
  }

  const handleSave = async (): Promise<void> => {
    const updatedConfig: SSOConfigData = {
      ...config,
      status: config.entityId && config.ssoUrl ? 'configured' : 'not_configured'
    }
    setConfig(updatedConfig)
    await window.streamSync.updateSSOConfig(updatedConfig)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTestConnection = (): void => {
    setTestResult('Coming soon -- contact support for SSO setup')
    setTimeout(() => setTestResult(null), 4000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Loading SSO configuration...</p>
      </div>
    )
  }

  const statusInfo = statusColors[config.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">SSO / SAML Configuration</h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure Single Sign-On for your organization.
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Provider */}
      <div className="bg-[#1a1f35] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-200">Identity Provider</h3>
        <div className="grid grid-cols-4 gap-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              onClick={() => setConfig({ ...config, provider: p.value })}
              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all border ${
                config.provider === p.value
                  ? 'bg-[#f97316]/10 border-[#f97316] text-[#f97316]'
                  : 'bg-[#111827] border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Fields */}
      <div className="bg-[#1a1f35] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-200">SAML Settings</h3>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Entity ID (Issuer)</label>
          <input
            type="text"
            value={config.entityId}
            onChange={(e) => setConfig({ ...config, entityId: e.target.value })}
            placeholder="https://your-idp.example.com/entity-id"
            className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f97316]"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">SSO URL (Login URL)</label>
          <input
            type="text"
            value={config.ssoUrl}
            onChange={(e) => setConfig({ ...config, ssoUrl: e.target.value })}
            placeholder="https://your-idp.example.com/sso/saml"
            className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f97316]"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            X.509 Certificate (PEM format)
          </label>
          <textarea
            value={config.certificate}
            onChange={(e) => setConfig({ ...config, certificate: e.target.value })}
            placeholder="-----BEGIN CERTIFICATE-----&#10;MIICpDCCA...&#10;-----END CERTIFICATE-----"
            rows={5}
            className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f97316] font-mono resize-none"
          />
        </div>
      </div>

      {/* Test result */}
      {testResult && (
        <div className="bg-[#f97316]/10 border border-[#f97316]/20 rounded-xl p-4 text-sm text-[#f97316]">
          {testResult}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#f97316] text-white rounded-lg font-medium hover:bg-[#ea580c] transition-colors"
        >
          {saved ? 'Saved!' : 'Save Configuration'}
        </button>
        <button
          onClick={handleTestConnection}
          disabled={!config.entityId || !config.ssoUrl}
          className="px-5 py-2.5 bg-[#1a1f35] text-slate-300 rounded-lg font-medium hover:bg-[#252b45] transition-colors border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Test Connection
        </button>
      </div>
    </div>
  )
}
