// ============================================
// UPDATED: src/app/api/articles/[id]/route.ts
// Article Detail API WITH TAG SYSTEM INTEGRATION
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';
import { findArticleById, findArticleBySlug, updateArticle, deleteArticle } from '@/models/Article';
import { getTagsForEntity, updateEntityTags } from '@/models/Tag';
import { deleteCommentsByArticle } from '@/models/Comment';
import { shouldCountView, recordView, incrementArticleViews } from '@/lib/view-tracker';
import { UserRole } from '@/types';

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  return 'unknown';
}

// GET - Get article by ID or slug WITH TAGS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let article;

    // Auto-detect: ID atau slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await findArticleById(id);
    } else {
      article = await findArticleBySlug(id);
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    // ✨ NEW: Get tags from tag system
    const tags = await getTagsForEntity('article', article._id!.toString());
    article.tags = tags.map(t => t.name);

    // View tracking
    const shouldTrackView = request.nextUrl.searchParams.get('view') === 'true';

    if (shouldTrackView && article._id) {
      const articleId = article._id.toString();
      const ipAddress = getClientIP(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const user = getUserFromRequest(request);
      const userId = user?.id;

      const shouldCount = await shouldCountView(
        articleId,
        ipAddress,
        userId,
        24 * 60 * 60 * 1000
      );

      if (shouldCount) {
        await recordView(articleId, ipAddress, userAgent, userId);
        await incrementArticleViews(articleId);
        article.views = (article.views || 0) + 1;
      }
    }

    return NextResponse.json(article, { status: 200 });
  } catch (error) {
    console.error('Get article error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update article WITH TAG SYSTEM
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    let article;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await findArticleById(id);
    } else {
      article = await findArticleBySlug(id);
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check permission
    const isAuthor = article.author.toString() === user.id;
    const isAdmin = hasPermission(user.role, UserRole.ADMIN);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses untuk mengubah artikel ini' },
        { status: 403 }
      );
    }

    const updates = await request.json();

    // Generate new slug if title changed
    if (updates.title) {
      updates.slug = generateSlug(updates.title);
    }

    // ✨ NEW: Handle tags separately
    const newTags = updates.tags;
    delete updates.tags; // Remove from updates object

    // Check if article is being published (status changing from false to true)
    const isBeingPublished = !article.published && updates.published === true;

    // Update article
    const success = await updateArticle(article._id!.toString(), updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal mengubah artikel' },
        { status: 400 }
      );
    }

    // ✨ NEW: Update tags via tag system
    if (newTags && Array.isArray(newTags)) {
      await updateEntityTags('article', article._id!.toString(), newTags, user.id);
    }

    // Send notification emails if article was just published
    console.log('🔍 DEBUG: Checking if article is being published...');
    console.log('🔍 DEBUG: article.published =', article.published);
    console.log('🔍 DEBUG: updates.published =', updates.published);
    console.log('🔍 DEBUG: isBeingPublished =', isBeingPublished);

    if (isBeingPublished) {
      console.log('✅ Article is being published! Starting email notification process...');

      // Import email functions
      const { getAllActiveSubscribers } = await import('@/models/Subscriber');
      const { sendNewArticleEmail } = await import('@/lib/email');

      try {
        const subscribers = await getAllActiveSubscribers();
        console.log(`📧 Found ${subscribers.length} active subscribers`);

        if (subscribers.length === 0) {
          console.log('⚠️ No active subscribers found. No emails will be sent.');
        } else {
          console.log('📤 Sending emails to all subscribers...');

          // Send emails to all subscribers with proper async handling
          await Promise.all(
            subscribers.map(async (subscriber, index) => {
              try {
                console.log(`📨 Sending email ${index + 1}/${subscribers.length} to ${subscriber.email}...`);
                const result = await sendNewArticleEmail(
                  subscriber.email,
                  article.title,
                  article.description,
                  article.slug,
                  subscriber.unsubscribeToken
                );
                console.log(`✅ Email sent successfully to ${subscriber.email}`, result);
              } catch (emailError) {
                console.error(`❌ Failed to send article notification to ${subscriber.email}:`, emailError);
              }
            })
          );

          console.log(`✅ Article published: Sent notifications to ${subscribers.length} subscribers`);
        }
      } catch (notificationError) {
        console.error('❌ Error sending article notifications:', notificationError);
        // Don't fail the update if notifications fail
      }
    } else {
      console.log('ℹ️ Article update does not trigger email notifications (not a new publication)');
    }

    return NextResponse.json(
      { message: 'Artikel berhasil diubah' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete article (unchanged)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    let article;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await findArticleById(id);
    } else {
      article = await findArticleBySlug(id);
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    const isAuthor = article.author.toString() === user.id;
    const isAdmin = hasPermission(user.role, UserRole.ADMIN);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses untuk menghapus artikel ini' },
        { status: 403 }
      );
    }

    // Delete comments and article
    const articleId = article._id!.toString();
    await deleteCommentsByArticle(articleId);

    // Note: Tag usage will be automatically cleaned up
    // because we're deleting the article
    const success = await deleteArticle(articleId);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal menghapus artikel' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Artikel berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}