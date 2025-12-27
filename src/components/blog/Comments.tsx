'use client';

import Giscus from '@giscus/react';

export function Comments() {
  return (
    <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Comments</h3>
      <Giscus
        id="comments"
        repo="saikothasan/Prokit" // REPLACE WITH YOUR REPO
        repoId="R_kgDOQqf2uw"      // REPLACE WITH YOUR REPO ID
        category="Q&A"
        categoryId="DIC_kwDOQqf2u84C0St2" // REPLACE WITH YOUR CATEGORY ID
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="light_tritanopia"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
