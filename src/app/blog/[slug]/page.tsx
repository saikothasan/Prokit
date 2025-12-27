import { getPostBySlug, getAllPosts } from '@/lib/blog';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

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
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to all posts
        </Link>
      </div>
      
      {/* Header */}
      <header className="mb-10 text-center">
        {post.categories && post.categories.length > 0 && (
          <div className="flex justify-center gap-2 mb-4">
            {post.categories.map(cat => (
                <span key={cat} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {cat}
                </span>
            ))}
          </div>
        )}
        
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
          </time>
        </div>
      </header>

      {/* Featured Image */}
      {post.image && (
        <div className="mb-12 relative h-[300px] md:h-[450px] w-full overflow-hidden rounded-2xl shadow-lg">
           <img 
            src={post.image} 
            alt={post.title} 
            className="object-cover w-full h-full" 
           />
        </div>
      )}

      {/* Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none 
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-p:text-gray-600 dark:prose-p:text-gray-300
        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>

      {/* Tags Footer */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                {post.tags.map(tag => (
                    <span key={tag} className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
