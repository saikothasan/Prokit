import Link from "next/link";
import { Cpu, Github, Send, ArrowUpRight, ShieldCheck, Activity, Globe } from "lucide-react";

export function Footer() {
	return (
		<footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--background)]">
			{/* Visual Pattern Overlay (Halftone) */}
			<div className="bg-halftone pointer-events-none absolute inset-0 opacity-[0.05]" />

			<div className="mx-auto max-w-[1400px]">
				{/* Top Section: Grid Layout */}
				<div className="grid grid-cols-1 divide-y divide-[var(--border)] md:grid-cols-4 md:divide-x md:divide-y-0">
					{/* Brand Column */}
					<div className="space-y-6 p-8 md:p-12">
						<Link href="/" className="flex items-center gap-2.5">
							<div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--foreground)] text-[var(--background)]">
								<Cpu size={14} />
							</div>
							<span className="text-sm font-bold tracking-tight text-[var(--foreground)]">
								PROKIT.UK
							</span>
						</Link>
						<p className="font-mono text-sm leading-relaxed text-[var(--muted-foreground)]">
							Advanced utility infrastructure for the modern web. Running on Edge
							Runtime.
						</p>
						<div className="flex gap-4">
							<SocialIcon
								href="https://github.com/saikothasan/Prokit"
								label="GitHub"
								icon={<Github size={16} />}
							/>
							<SocialIcon
								href="https://t.me/drkingbd"
								label="Telegram"
								icon={<Send size={16} />}
							/>
						</div>
					</div>

					{/* Tools Index */}
					<div className="p-8 md:p-12">
						<h4 className="mb-6 font-mono text-xs font-semibold tracking-wider text-[var(--foreground)] uppercase">
							{`// Core_Modules`}
						</h4>
						<ul className="space-y-3">
							<FooterLink href="/tool/bin-checker" code="SEC-01">
								BIN Inspector
							</FooterLink>
							<FooterLink href="/tool/ai-translator" code="AI-02">
								Neural Translate
							</FooterLink>
							<FooterLink href="/tool/dns-lookup" code="DNS-05">
								DNS Propagation
							</FooterLink>
							<FooterLink href="/tool/image-optimizer" code="IMG-09">
								Media Optimize
							</FooterLink>
						</ul>
					</div>

					{/* Resources Index */}
					<div className="p-8 md:p-12">
						<h4 className="mb-6 font-mono text-xs font-semibold tracking-wider text-[var(--foreground)] uppercase">
							{`// Documentation`}
						</h4>
						<ul className="space-y-3">
							<FooterLink href="/blog" code="DOC-01">
								Engineering Blog
							</FooterLink>
							<FooterLink href="/api-docs" code="API-00">
								API Reference
							</FooterLink>
							<FooterLink href="/status" code="SYS-STAT">
								System Status
							</FooterLink>
						</ul>
					</div>

					{/* Legal / Compliance */}
					<div className="p-8 md:p-12">
						<h4 className="mb-6 font-mono text-xs font-semibold tracking-wider text-[var(--foreground)] uppercase">
							{`// Compliance`}
						</h4>
						<ul className="space-y-3">
							<FooterLink href="/privacy" code="LEG-01">
								Privacy Protocol
							</FooterLink>
							<FooterLink href="/terms" code="LEG-02">
								Terms of Use
							</FooterLink>
						</ul>
					</div>
				</div>

				{/* Bottom System Bar */}
				<div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] bg-[var(--muted)]/50 px-6 py-4 font-mono text-[10px] tracking-wide text-[var(--muted-foreground)] uppercase md:flex-row">
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
							<ShieldCheck size={12} />
							<span>SECURE CONNECTION</span>
						</div>
						<div className="hidden items-center gap-2 md:flex">
							<Globe size={12} />
							<span>REGION: GLOBAL_EDGE</span>
						</div>
						<div className="hidden items-center gap-2 md:flex">
							<Activity size={12} />
							<span>UPTIME: 99.99%</span>
						</div>
					</div>

					<div className="flex items-center gap-1">
						<span>© {new Date().getFullYear()} PROKIT SYSTEMS. ENGINEERED BY</span>
						<a
							href="https://t.me/drkingbd"
							target="_blank"
							className="text-[var(--foreground)] decoration-1 underline-offset-2 hover:underline"
						>
							DRKINGBD
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

// Sub-components
function SocialIcon({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
	return (
		<Link
			href={href}
			target="_blank"
			aria-label={label}
			className="border border-[var(--border)] p-2 text-[var(--muted-foreground)] transition-all hover:border-[var(--foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
		>
			{icon}
		</Link>
	);
}

function FooterLink({
	href,
	children,
	code,
}: {
	href: string;
	children: React.ReactNode;
	code: string;
}) {
	return (
		<Link
			href={href}
			className="group flex items-center justify-between text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
		>
			<span className="flex items-center gap-3">
				<span className="font-mono text-[10px] text-[var(--border)] transition-colors group-hover:text-blue-500">
					{code}
				</span>
				{children}
			</span>
			<ArrowUpRight
				size={12}
				className="opacity-0 transition-opacity group-hover:opacity-100"
			/>
		</Link>
	);
}
