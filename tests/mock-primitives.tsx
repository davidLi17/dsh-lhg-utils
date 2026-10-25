import React, { type ReactNode, type ReactElement } from 'react'

export function Modal({
  open,
  onClose,
  title,
  closeLabel,
  children,
  footer,
  className,
}: {
  open: boolean
  onClose?: () => void
  title?: string
  closeLabel?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}): ReactElement | null {
  if (!open) return null
  return (
    <dialog
      open
      className={`dsh-modal-mock btw-selection-dialog ${className ?? ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="dsh-modal-header">
        <h2>{title}</h2>
        <button type="button" aria-label={closeLabel} onClick={onClose}>×</button>
      </div>
      <div className="dsh-modal-body">{children}</div>
      {footer && <div className="dsh-modal-footer">{footer}</div>}
    </dialog>
  )
}

export function Button({
  variant,
  disabled,
  onClick,
  children,
  className,
  type = 'button',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string
  disabled?: boolean
  onClick?: () => void
  children?: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}): ReactElement {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`dsh-button-mock ${variant ?? ''} ${className ?? ''}`}
    >
      {children}
    </button>
  )
}

// Wiring-only mock: native Menu focus/keys require separate host-component or browser verification.
export function Menu({ open, anchor, items = [], selectedId, onSelect, onClose, align, portal, autoFocus }: {
  open: boolean; anchor: ReactNode; items?: { id: string; label: ReactNode; icon?: ReactNode }[];
  selectedId?: string; onSelect?: (id: string) => void; onClose: () => void;
  align?: string; portal?: boolean; autoFocus?: boolean;
}): ReactElement {
  return <span data-align={align} data-portal={String(portal)} data-autofocus={String(autoFocus)}>
    {anchor}
    {open && <div role="menu"><button data-dismiss onClick={onClose}>dismiss</button>{items.map(item =>
      <button key={item.id} role="menuitem" aria-current={item.id === selectedId ? 'true' : undefined} onClick={() => onSelect?.(item.id)}>
        {item.icon}{item.label}
      </button>)}
    </div>}
  </span>
}
export function Tooltip({ children, label }: { children: ReactElement; label: string }): ReactElement {
  return <span title={label}>{children}</span>
}
export function IconLightOutlineMedium(): ReactElement { return <svg data-icon="light" /> }
export function IconDarkOutlineMedium(): ReactElement { return <svg data-icon="dark" /> }
export function IconFollowsystemOutlineMedium(): ReactElement { return <svg data-icon="system" /> }
