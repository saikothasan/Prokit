import React from 'react';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown, { Components } from 'react-markdown';

// Icons
import { ArrowLeft, Calendar, Tag, Clock, Share2 } from 'lucide-react';

// Custom Components
import { AiSummary } from '@/components/blog/AiSummary';
import { Comments } from '@/components/blog/Comments';
import { CodeBlock } from '@/components/blog/CodeBlock';
import { MediaPlayer } from '@/components/blog/MediaPlayer';

interface Props {
  params: Promise<{ slug: string }>;
}

// 1. Generate Static Params for SSG
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 2. Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | ProKit Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: ['ProKit Team'],
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  };
}

// 3. Custom Markdown Components Configuration
// We define specific types for the custom code component props
type CodeProps = React.ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
};

const MarkdownComponents: Components = {
  // Enhanced Code Blocks with Copy Button & Syntax Highlighting
  code: ({ className, children, ...props }: CodeProps) => {
    // Note: 'node' was unused and removed to satisfy linter
    const match = /language-(\w+)/.exec(className || '');
    const codeContent = String(children).replace(/\n$/, '');
    const isInline = props.inline || false;

    if (!isInline && match) {
      return (
        <CodeBlock 
          language={match[1]} 
          value={codeContent} 
        />
      );
    }
    
    return (
      <code 
        className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-mono text-sm border border-gray-200 dark:border-gray-700" 
        {...props}
      >
        {children}
      </code>
    );
  },

  // Smart Links: Handles Video/Audio files and YouTube embeds automatically
  a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href) return null;

    // A. Internal Links
    if (href.startsWith('/')) {
      return (
        <Link href={href} className="text-blue-600 dark:text-blue-400 hover:underline decoration-2 underline-offset-2 transition-colors">
          {children}
        </Link>
      );
    }

    // B. Native Video Player (mp4, webm)
    if (href.match(/\.(mp4|webm)$/i)) {
      return <MediaPlayer src={href} type="video" />;
    }

    // C. Native Audio Player (mp3, wav, ogg)
    if (href.match(/\.(mp3|wav|ogg)$/i)) {
      return <MediaPlayer src={href} type="audio" />;
    }

    // D. YouTube Embeds
    if (href.includes('youtube.com/watch') || href.includes('youtu.be/')) {
      const videoId = href.split('v=')[1]?.split('&')[0] || href.split('/').pop();
      if (videoId) {
        return (
          <div className="my-10 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 aspect-video bg-gray-100 dark:bg-gray-900">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        );
      }
    }

    // E. External Standard Links
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 hover:underline decoration-2 underline-offset-2 transition-all"
      >
        {children}
      </a>
    );
  },

  // Enhanced Image Rendering
  // Note: Using standard <img> tag for arbitrary external URLs to avoid Next.js Config domain whitelisting issues.
  // Next.js warns about this, but it is intentional for a general Markdown renderer.
  img: ({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!src) return null;
    return (
      <figure className="my-10 group">
        <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={src} 
            alt={alt || ''} 
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
        {alt && (
          <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },

  // Stylish Blockquotes (OpenAI Style)
  blockquote: ({ children }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-blue-500 pl-6 py-1 my-8 text-xl font-medium italic text-gray-900 dark:text-gray-100 bg-transparent">
      {children}
    </blockquote>
  ),

  // Cleaner Headings
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-bold mt-16 mb-6 tracking-tight text-gray-900 dark:text-gray-50">
      {children}
    </h2>
  ),
  h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-bold mt-12 mb-4 tracking-tight text-gray-900 dark:text-gray-100">
      {children}
    </h3>
  ),
  
  // Lists
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside ml-6 space-y-2 mb-6 text-gray-700 dark:text-gray-300 marker:text-gray-400">
      {children}
    </ul>
  ),
  ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside ml-6 space-y-2 mb-6 text-gray-700 dark:text-gray-300 marker:font-bold marker:text-gray-500">
      {children}
    </ol>
  ),
  
  // Paragraphs
  p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300 text-lg">
      {children}
    </p>
  ),
  
  // Horizontal Rule
  hr: () => <hr className="my-12 border-gray-200 dark:border-gray-800" />
};

// 4. Main Page Component
export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        
        {/* Navigation */}
        <div className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Blog
          </Link>
        </div>
        
        {/* Article Header */}
        <header className="text-center mb-12">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex justify-center gap-2 mb-6">
              {post.categories.map(cat => (
                  <span key={cat} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-900/50">
                      {cat}
                  </span>
              ))}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 dark:text-gray-400 text-sm font-medium">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
              </time>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              {post.readingTime || '5 min read'}
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-12 relative w-full aspect-[16/9] overflow-hidden rounded-2xl shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10 bg-gray-100 dark:bg-gray-900">
             <Image
              src={post.image} 
              alt={post.title} 
              fill
              priority
              className="object-cover" 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
             />
          </div>
        )}

        {/* AI Summary Widget */}
        <AiSummary content={post.content} />

        {/* Main Content Area */}
        <article className="prose prose-lg dark:prose-invert max-w-none prose-a:no-underline">
          <ReactMarkdown components={MarkdownComponents}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Footer: Tags & Share */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                      <Link 
                        key={tag} 
                        href={`/blog?tag=${tag}`}
                        className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
                      >
                          <Tag className="w-3 h-3 mr-1.5 opacity-70" />
                          {tag}
                      </Link>
                  ))}
              </div>
            )}

            {/* Share Button (Client-side logic would handle actual sharing) */}
            <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <Share2 className="w-4 h-4" />
              Share Post
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-16">
          <Comments />
        </div>
        
      </main>
    </div>
  );
}
