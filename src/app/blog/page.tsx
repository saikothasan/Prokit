import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image'; // Import Image
import { Metadata } from 'next';
import { Calendar, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | ProKit',
  description: 'Tutorials, guides, and updates from the ProKit team.',
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          ProKit Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Latest updates, tutorials, and developer insights.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-lg text-gray-500">No posts found. Add a markdown file to <code>content/posts</code>.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article 
              key={post.slug} 
              className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {post.image && (
                <div className="h-48 overflow-hidden relative group">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                   {post.categories?.[0] && (
                     <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                       {post.categories[0]}
                     </span>
                   )}
                   <span className="flex items-center gap-1">
                     <Calendar className="w-3.5 h-3.5" />
                     {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                   </span>
                </div>

                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 leading-snug">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                  {post.description}
                </p>

                <Link 
                  href={`/blog/${post.slug}`} 
                  className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
                >
                  Read Article 
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
