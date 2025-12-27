import { getPostBySlug, getAllPosts } from '@/lib/blog';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, Clock } from 'lucide-react';
import { AiSummary } from '@/components/blog/AiSummary';
import { Comments } from '@/components/blog/Comments';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: `${post.title} | ProKit Blog`,
    description: post.description,
    openGraph: {
      images: post.image ? [post.image] : [],
    }
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Back Link */}
      <div className="mb-8">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to all posts
        </Link>
      </div>
      
      {/* Header */}
      <header className="mb-8 text-center">
        {post.categories && post.categories.length > 0 && (
          <div className="flex justify-center gap-2 mb-6">
            {post.categories.map(cat => (
                <span key={cat} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    {cat}
                </span>
            ))}
          </div>
        )}
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 leading-tight tracking-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-500 dark:text-gray-400 text-sm font-medium">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
            </time>
          </div>
          <span className="hidden sm:inline w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-500" />
            {post.readingTime}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.image && (
        <div className="mb-10 relative h-[300px] md:h-[450px] w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10">
           <Image 
            src={post.image} 
            alt={post.title} 
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-105" 
           />
        </div>
      )}

      {/* AI Summary Section */}
      <AiSummary content={post.content} />

      {/* Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none 
        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-900/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:rounded-r-lg
        prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-img:rounded-xl prose-img:shadow-lg
        prose-ul:list-disc prose-ul:pl-6
        prose-ol:list-decimal prose-ol:pl-6">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>

      {/* Tags Footer */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">Tags</h4>
            <div className="flex items-center gap-2 flex-wrap">
                {post.tags.map(tag => (
                    <span key={tag} className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors cursor-default">
                        <Tag className="w-3 h-3 mr-1.5 opacity-70" />
                        {tag}
                    </span>
                ))}
            </div>
        </div>
      )}

      {/* Comments Section */}
      <Comments />
    </div>
  );
}
