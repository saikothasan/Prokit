# ProKit

**ProKit** is a comprehensive, serverless toolkit for developers, security researchers, and data analysts. Built on **Next.js 15** and deployed to **Cloudflare Workers** via **OpenNext**, it leverages the Edge to provide instant, high-performance utilities ranging from AI analysis to network security scanning.

## 🚀 Key Features

ProKit includes a suite of specialized tools grouped by functionality:

### 🛡️ Security Suite

* **SSL/TLS Inspector**: Deep analysis of SSL certificates, handshake protocols, and expiry dates.
* **TCP Port Scanner**: Scan common ports (FTP, SSH, HTTP, SQL) on any target server.
* **Crypto Key Generator**: Generate production-grade RSA keys, API secrets, and JWT tokens.
* **BIN Checker**: Validate Bank Identification Numbers and retrieve card issuer details.

### 🧠 AI Power Tools (Cloudflare Workers AI)

* **SiteScan AI Auditor**: Autonomous website auditing for SEO, UX, and performance using computer vision.
* **Smart Web Scraper**: Extract structured data or summaries from any URL.
* **AI Markdown Converter**: Convert HTML web pages into clean, structured Markdown for LLMs.
* **AI Translator**: Context-aware neural network translation.

### 🛠️ Developer & Network Utilities

* **Curl Runner**: Execute HTTP requests directly from the Edge to test APIs.
* **Fake Address Generator**: Generate localized mock data for testing in 50+ languages.
* **DNS Propagation**: Check A, MX, and NS records across global nodes.
* **Image Optimizer**: Compress and resize images to WebP/AVIF.
* **Website Screenshot**: Capture high-fidelity viewport screenshots.

### ✍️ Editorial Blog

* **Markdown/MDX Support**: Full support for rich text, code highlighting, and embedded media.
* **Stark Minimalist Design**: A clean, reader-focused typography system.
* **Text-to-Speech**: Built-in audio player for listening to articles.

---

## 🏗️ Architecture & Tech Stack

ProKit is designed for the **Edge**, minimizing cold starts and latency.

* **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
* **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
* **Adapter**: [OpenNext](https://opennext.js.org/) (for robust Next.js support on Cloudflare)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Lucide React
* **AI Inference**: Cloudflare Workers AI (Llama 3, etc.)
* **Browser Automation**: Cloudflare Browser Rendering (Puppeteer)

---

## ⚡ Getting Started

### Prerequisites

* Node.js 20+ or Bun
* A Cloudflare account
* `wrangler` CLI installed globally

### 1. Clone & Install

```bash
git clone https://github.com/saikothasan/prokit.git
cd prokit
npm install
# or
bun install

```

### 2. Configure Environment

Rename `wrangler.jsonc` or ensure you have the correct bindings set up in your Cloudflare dashboard for:

* **AI**: `AI` binding.
* **Browser Rendering**: `BROWSER` binding.

### 3. Run Locally

To run the Next.js dev server:

```bash
npm run dev

```

To preview the Cloudflare Worker build locally (closer to production):

```bash
npm run preview

```

---

## 🚀 Deployment

ProKit uses **OpenNext** to build and deploy the Next.js app to Cloudflare Workers.

```bash
npm run deploy

```

This command runs `opennextjs-cloudflare build` followed by `opennextjs-cloudflare deploy`.

---

## 📂 Project Structure

```
.
├── content/             # Markdown files for the blog
├── src/
│   ├── app/             # Next.js App Router pages & API routes
│   ├── components/      # UI components (Tools, Blog, Layout)
│   ├── lib/             # Utilities (Blog parser, Tool configs)
│   └── middleware.ts    # Edge middleware
├── open-next.config.ts  # OpenNext configuration
├── wrangler.jsonc       # Cloudflare Workers configuration
└── package.json

```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
