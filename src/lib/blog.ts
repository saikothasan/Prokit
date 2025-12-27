import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define where the markdown files are located
const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface Post {
  slug: string;
  title: string;
  date: string;
  image?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  content: string;
  readingTime: string; // Added missing field
}

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // Parse metadata section
  const { data, content } = matter(fileContents);

  // Calculate reading time (approx 200 words per minute)
  const words = content.trim().split(/\s+/).length;
  const readTimeMinutes = Math.ceil(words / 200);
  const readingTime = `${readTimeMinutes} min read`;

  return {
    slug: realSlug,
    title: data.title,
    // Ensure date is a string
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    image: data.image || null,
    description: data.description || '',
    categories: data.categories || [],
    tags: data.tags || [],
    content,
    readingTime, // Return the calculated value
  };
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // Sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
