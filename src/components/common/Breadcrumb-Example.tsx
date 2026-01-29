// ============================================
// BREADCRUMB USAGE EXAMPLES
// Copy snippets ini ke page yang sesuai
// ============================================

// ============================================
// 1. ADMIN DASHBOARD (/admin/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { Shield } from 'lucide-react';

// Di dalam component:
<Breadcrumb
  items={[
    { label: 'Admin', icon: <Shield size={16} strokeWidth={2.5} /> },
  ]}
/>

// ============================================
// 2. ADMIN ARTICLES (/admin/articles/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { Shield, FileText } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Admin', href: '/admin', icon: <Shield size={16} strokeWidth={2.5} /> },
    { label: 'Articles' },
  ]}
/>

// ============================================
// 3. ADMIN COURSES (/admin/courses/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { Shield, BookOpen } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Admin', href: '/admin', icon: <Shield size={16} strokeWidth={2.5} /> },
    { label: 'Courses' },
  ]}
/>

// ============================================
// 4. ADMIN USERS (/admin/users/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { Shield, Users } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Admin', href: '/admin', icon: <Shield size={16} strokeWidth={2.5} /> },
    { label: 'Users' },
  ]}
/>

// ============================================
// 5. ARTICLES LIST (/articles/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { FileText } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Articles', icon: <FileText size={16} strokeWidth={2.5} /> },
  ]}
/>

// ============================================
// 6. ARTICLE DETAIL (/articles/[slug]/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { FileText } from 'lucide-react';

// Assuming you have article data:
<Breadcrumb
  items={[
    { label: 'Articles', href: '/articles', icon: <FileText size={16} strokeWidth={2.5} /> },
    { label: article.category, href: `/articles?category=${article.category}` },
    { label: article.title },
  ]}
/>

// ============================================
// 7. ARTICLE EDIT (/articles/[slug]/edit/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { FileText, Edit } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Articles', href: '/articles', icon: <FileText size={16} strokeWidth={2.5} /> },
    { label: article.title, href: `/articles/${article.slug}` },
    { label: 'Edit', icon: <Edit size={16} strokeWidth={2.5} /> },
  ]}
/>

// ============================================
// 8. COURSES LIST (/courses/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { BookOpen } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Courses', icon: <BookOpen size={16} strokeWidth={2.5} /> },
  ]}
/>

// ============================================
// 9. COURSE DETAIL (/courses/[slug]/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { BookOpen } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Courses', href: '/courses', icon: <BookOpen size={16} strokeWidth={2.5} /> },
    { label: course.title },
  ]}
/>

// ============================================
// 10. MY COURSES (/my-courses/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { BookOpen, User } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'My Courses', icon: <BookOpen size={16} strokeWidth={2.5} /> },
  ]}
/>

// ============================================
// 11. MY ARTICLES (/my-articles/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { FileText, User } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'My Articles', icon: <FileText size={16} strokeWidth={2.5} /> },
  ]}
/>

// ============================================
// 12. CREATE ARTICLE (/articles/create/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { FileText, Plus } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Articles', href: '/articles', icon: <FileText size={16} strokeWidth={2.5} /> },
    { label: 'Create', icon: <Plus size={16} strokeWidth={2.5} /> },
  ]}
/>

// ============================================
// 13. CREATE COURSE (/courses/create/page.tsx)
// ============================================
import Breadcrumb from '@/components/common/Breadcrumb';
import { BookOpen, Plus } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Courses', href: '/courses', icon: <BookOpen size={16} strokeWidth={2.5} /> },
    { label: 'Create', icon: <Plus size={16} strokeWidth={2.5} /> },
  ]}
/>

// ============================================
// ADVANCED USAGE
// ============================================

// Without Home icon:
<Breadcrumb
  showHome={false}
  items={[
    { label: 'Admin', href: '/admin' },
    { label: 'Articles' },
  ]}
/>

// With custom className:
<Breadcrumb
  className="mb-8"
  items={[
    { label: 'Admin', href: '/admin' },
  ]}
/>

// Dynamic breadcrumb based on data:
const breadcrumbItems = [
  { label: 'Articles', href: '/articles', icon: <FileText size={16} /> },
];

if (article?.category) {
  breadcrumbItems.push({
    label: article.category,
    href: `/articles?category=${article.category}`,
  });
}

breadcrumbItems.push({ label: article?.title || 'Loading...' });

<Breadcrumb items={breadcrumbItems} />