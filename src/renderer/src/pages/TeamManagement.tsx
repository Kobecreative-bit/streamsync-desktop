import { useState } from 'react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  avatarInitials: string
}

interface TeamInvitation {
  id: string
  email: string
  role: 'admin' | 'member'
  sentAt: string
  status: 'pending' | 'expired'
}

interface TeamManagementProps {
  currentPlan?: string
  members?: TeamMember[]
  invitations?: TeamInvitation[]
  maxSeats?: number
  onInvite?: (email: string, role: 'admin' | 'member') => Promise<void>
  onRevoke?: (invitationId: string) => Promise<void>
  onRemoveMember?: (memberId: string) => Promise<void>
  onChangeRole?: (memberId: string, role: 'admin' | 'member') => Promise<void>
}

const defaultMembers: TeamMember[] = [
  {
    id: '1',
    name: 'You',
    email: 'owner@example.com',
    role: 'owner',
    joinedAt: new Date().toISOString(),
    avatarInitials: 'YO'
  }
]

function getMaxSeats(plan: string): number {
  switch (plan.toLowerCase()) {
    case 'starter':
      return 1
    case 'pro':
      return 2
    case 'enterprise':
      return -1 // unlimited
    default:
      return 1
  }
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'owner':
      return 'bg-accent/10 text-accent'
    case 'admin':
      return 'bg-blue-500/10 text-blue-400'
    default:
      return 'bg-white/5 text-text-secondary'
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function TeamManagement({
  currentPlan = 'starter',
  members = defaultMembers,
  invitations = [],
  maxSeats: maxSeatsProp,
  onInvite,
  onRevoke,
  onRemoveMember,
  onChangeRole
}: TeamManagementProps): JSX.Element {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [inviteLoading, setInviteLoading] = useState(false)

  const maxSeats = maxSeatsProp ?? getMaxSeats(currentPlan)
  const isUnlimited = maxSeats === -1
  const usedSeats = members.length
  const canInvite = isUnlimited || usedSeats + invitations.length < maxSeats

  const handleInvite = async (): Promise<void> => {
    if (!inviteEmail.trim() || inviteLoading) return
    setInviteLoading(true)
    try {
      await onInvite?.(inviteEmail.trim(), inviteRole)
      setInviteEmail('')
      setShowInviteModal(false)
    } catch {
      // Error handling
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRevoke = async (invitationId: string): Promise<void> => {
    await onRevoke?.(invitationId)
  }

  const handleRemoveMember = async (memberId: string): Promise<void> => {
    await onRemoveMember?.(memberId)
  }

  const handleChangeRole = async (memberId: string, role: 'admin' | 'member'): Promise<void> => {
    await onChangeRole?.(memberId, role)
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Team Management</h1>
            <p className="text-text-secondary">Manage your team members and invitations</p>
          </div>
          <button
            onClick={() => canInvite && setShowInviteModal(true)}
            disabled={!canInvite}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent to-accent2 hover:opacity-90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Invite Member
          </button>
        </div>

        {/* Seat Counter */}
        <div className="bg-bg-card rounded-xl border border-white/5 p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Team Seats</p>
              <p className="text-xs text-text-secondary">
                {usedSeats}/{isUnlimited ? 'Unlimited' : maxSeats} seats used
              </p>
            </div>
          </div>
          {!isUnlimited && !canInvite && (
            <span className="text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-full font-medium">
              Upgrade for more seats
            </span>
          )}
          {!isUnlimited && canInvite && (
            <div className="flex gap-1">
              {Array.from({ length: maxSeats }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < usedSeats ? 'bg-accent' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Members Table */}
        <section className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Members ({members.length})
            </h2>
          </div>

          <div className="bg-bg-card rounded-xl border border-white/5 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-white/5 text-xs font-medium text-text-secondary uppercase tracking-wider">
              <span>Member</span>
              <span>Email</span>
              <span>Role</span>
              <span className="w-20 text-right">Joined</span>
            </div>

            {/* Rows */}
            {members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-4 border-b border-white/5 last:border-0 items-center group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-text-primary shrink-0">
                    {member.avatarInitials}
                  </div>
                  <span className="text-sm font-medium text-text-primary truncate">
                    {member.name}
                  </span>
                </div>
                <span className="text-sm text-text-secondary truncate">{member.email}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getRoleBadgeClass(member.role)}`}>
                    {member.role}
                  </span>
                  {member.role !== 'owner' && onChangeRole && (
                    <button
                      onClick={() =>
                        handleChangeRole(
                          member.id,
                          member.role === 'admin' ? 'member' : 'admin'
                        )
                      }
                      className="opacity-0 group-hover:opacity-100 text-xs text-text-secondary hover:text-text-primary transition-all"
                      title="Change role"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="w-20 flex items-center justify-end gap-2">
                  <span className="text-xs text-text-secondary">
                    {formatDate(member.joinedAt)}
                  </span>
                  {member.role !== 'owner' && onRemoveMember && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 transition-all"
                      title="Remove member"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Pending Invitations ({invitations.length})
              </h2>
            </div>

            <div className="bg-bg-card rounded-xl border border-white/5 overflow-hidden">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between px-5 py-4 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{invitation.email}</p>
                      <p className="text-xs text-text-secondary">
                        Sent {formatDate(invitation.sentAt)} &middot;{' '}
                        <span className="capitalize">{invitation.role}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        invitation.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {invitation.status}
                    </span>
                    {onRevoke && (
                      <button
                        onClick={() => handleRevoke(invitation.id)}
                        className="text-xs text-text-secondary hover:text-red-400 transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Plan Limits Info */}
        {!isUnlimited && (
          <div className="bg-bg-card rounded-xl border border-white/5 p-5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Need more team seats?
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Your <span className="capitalize">{currentPlan}</span> plan includes {maxSeats} seat{maxSeats !== 1 ? 's' : ''}.
                  Upgrade to {currentPlan.toLowerCase() === 'starter' ? 'Pro for 2 seats' : 'Enterprise for unlimited seats'}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-secondary rounded-xl border border-white/10 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-semibold text-text-primary">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Role
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setInviteRole('member')}
                    className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      inviteRole === 'member'
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-white/10 bg-white/5 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <div className="text-left">
                      <p className={inviteRole === 'member' ? 'text-accent' : 'text-text-primary'}>Member</p>
                      <p className="text-xs text-text-secondary mt-0.5">Can stream and manage products</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setInviteRole('admin')}
                    className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      inviteRole === 'admin'
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-white/10 bg-white/5 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <div className="text-left">
                      <p className={inviteRole === 'admin' ? 'text-accent' : 'text-text-primary'}>Admin</p>
                      <p className="text-xs text-text-secondary mt-0.5">Full access including billing</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviteLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-accent to-accent2 hover:opacity-90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {inviteLoading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamManagement
