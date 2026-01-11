"use client";

import { useState } from "react";
import Link from "next/link";
import { Cpu, Menu, X, Github, Terminal } from "lucide-react";

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
			<div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* 1. Technical Brand Identifier */}
				<Link
					href="/"
					className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[var(--foreground)] text-[var(--background)]">
						<Cpu size={16} strokeWidth={2.5} />
					</div>
					<div className="flex flex-col leading-none">
						<span className="text-sm font-bold tracking-tight text-[var(--foreground)]">
							PROKIT<span className="text-[var(--muted-foreground)]">.UK</span>
						</span>
						<span className="font-mono text-[10px] text-[var(--muted-foreground)] transition-colors group-hover:text-blue-500">
							SYS.V.1.0
						</span>
					</div>
				</Link>

				{/* 2. Desktop Navigation (Breadcrumb Style) */}
				<nav className="hidden items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] md:flex">
					<NavLink href="/">/index</NavLink>
					<span className="text-[var(--border)]">/</span>
					<NavLink href="/categories">/modules</NavLink>
					<span className="text-[var(--border)]">/</span>
					<NavLink href="/about">/specs</NavLink>
				</nav>

				{/* 3. Status & Actions */}
				<div className="hidden items-center gap-4 md:flex">
					{/* Live Status Indicator */}
					<div className="hidden items-center gap-2 rounded-sm border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 lg:flex">
						<div className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
						</div>
						<span className="font-mono text-[10px] font-medium text-[var(--foreground)]">
							SYSTEM ONLINE
						</span>
					</div>

					<div className="h-4 w-px bg-[var(--border)]" />

					<Link
						href="https://github.com/saikothasan/Prokit"
						target="_blank"
						aria-label="GitHub Repository"
						className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
					>
						<Github size={18} />
					</Link>

					<Link
						href="https://t.me/drkingbd"
						target="_blank"
						className="inline-flex items-center gap-2 rounded-sm bg-[var(--foreground)] px-4 py-1.5 text-xs font-medium text-[var(--background)] transition-all hover:opacity-90"
					>
						<Terminal size={12} />
						<span>JOIN NET</span>
					</Link>
				</div>

				{/* 4. Mobile Toggle */}
				<button
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					aria-label={isMenuOpen ? "Close menu" : "Open menu"}
					className="rounded-sm p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] md:hidden"
				>
					{isMenuOpen ? <X size={20} /> : <Menu size={20} />}
				</button>
			</div>

			{/* 5. Mobile Menu (Technical List) */}
			{isMenuOpen && (
				<div className="border-b border-[var(--border)] bg-[var(--background)] md:hidden">
					<div className="space-y-1 p-4 font-mono text-sm">
						<MobileLink href="/" onClick={() => setIsMenuOpen(false)} index="01">
							Index
						</MobileLink>
						<MobileLink
							href="/categories"
							onClick={() => setIsMenuOpen(false)}
							index="02"
						>
							Modules
						</MobileLink>
						<MobileLink href="/about" onClick={() => setIsMenuOpen(false)} index="03">
							Specifications
						</MobileLink>

						<div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4">
							<Link
								href="https://t.me/drkingbd"
								target="_blank"
								className="flex items-center justify-center gap-2 border border-[var(--border)] bg-[var(--muted)] p-2 text-xs font-medium text-[var(--foreground)]"
							>
								TELEGRAM
							</Link>
							<Link
								href="https://github.com/saikothasan/Prokit"
								target="_blank"
								className="flex items-center justify-center gap-2 border border-[var(--border)] bg-[var(--foreground)] p-2 text-xs font-medium text-[var(--background)]"
							>
								GITHUB
							</Link>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link
			href={href}
			className="rounded-sm px-3 py-1 transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
		>
			{children}
		</Link>
	);
}

function MobileLink({
	href,
	children,
	onClick,
	index,
}: {
	href: string;
	children: React.ReactNode;
	onClick: () => void;
	index: string;
}) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className="flex items-center gap-4 p-3 transition-colors hover:bg-[var(--muted)]"
		>
			<span className="text-xs text-[var(--muted-foreground)]">
				{index} {`//`}
			</span>
			<span className="font-medium text-[var(--foreground)] uppercase">{children}</span>
		</Link>
	);
}
