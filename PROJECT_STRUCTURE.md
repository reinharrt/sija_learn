# Project File Structure

This document provides a complete visual tree of the `src` directory to help you locate files.

```text
src
+---app
|   |   favicon.ico
|   |   globals.css
|   |   layout.tsx
|   |   not-found.tsx
|   |   page.tsx
|   |
|   +---(auth)
|   |   |   README.md
|   |   |
|   |   +---forgot-password
|   |   |       page.tsx
|   |   |
|   |   +---login
|   |   |       page.tsx
|   |   |
|   |   +---register
|   |   |       page.tsx
|   |   |
|   |   \---verify-email
|   |           page.tsx
|   |
|   +---admin
|   |   |   layout.tsx
|   |   |   page.tsx
|   |   |   README.md
|   |   |
|   |   +---articles
|   |   |       page.tsx
|   |   |
|   |   +---courses
|   |   |   |   page.tsx
|   |   |   |
|   |   |   +---[id]
|   |   |   |       page.tsx
|   |   |   |
|   |   |   \---create
|   |   |           page.tsx
|   |   |
|   |   +---dashboard
|   |   |       page.tsx
|   |   |
|   |   +---quizzes
|   |   |       page.tsx
|   |   |
|   |   +---tags
|   |   |       page.tsx
|   |   |
|   |   \---users
|   |           page.tsx
|   |
|   +---api
|   |   |   README.md
|   |   |
|   |   +---admin
|   |   |   |   README.md
|   |   |   |
|   |   |   +---courses
|   |   |   |   \---[id]
|   |   |   |       +---articles
|   |   |   |       |       route.ts
|   |   |   |       |
|   |   |   |       \---quizzes
|   |   |   |               route.ts
|   |   |   |
|   |   |   +---init-view-tracking
|   |   |   |       route.ts
|   |   |   |
|   |   |   \---quizzes
|   |   |       +---create
|   |   |       |       route.ts
|   |   |       |
|   |   |       \---[id]
|   |   |           |   route.ts
|   |   |           |
|   |   |           +---analytics
|   |   |           |       route.ts
|   |   |           |
|   |   |           \---assign
|   |   |                   route.ts
|   |   |
|   |   +---articles
|   |   |   |   README.md
|   |   |   |   route.ts
|   |   |   |
|   |   |   \---[id]
|   |   |           route.ts
|   |   |
|   |   +---auth
|   |   |   +---change-password
|   |   |   |   +---request-otp
|   |   |   |   |       route.ts
|   |   |   |   |
|   |   |   |   +---verify-otp
|   |   |   |   |       route.ts
|   |   |   |   |
|   |   |   |   \---verify-otp-only
|   |   |   |           route.ts
|   |   |   |
|   |   |   +---login
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---logout
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---register
|   |   |   |       route.ts
|   |   |   |
|   |   |   \---verify-email
|   |   |           route.ts
|   |   |
|   |   +---categories
|   |   |       route.ts
|   |   |
|   |   +---comments
|   |   |   |   route.ts
|   |   |   |
|   |   |   \---[id]
|   |   |           route.ts
|   |   |
|   |   +---courses
|   |   |   |   README.md
|   |   |   |   route.ts
|   |   |   |
|   |   |   \---[id]
|   |   |       |   route.ts
|   |   |       |
|   |   |       +---quizzes
|   |   |       |       route.ts
|   |   |       |
|   |   |       \---quiz-status
|   |   |               route.ts
|   |   |
|   |   +---enrollments
|   |   |   |   README.md
|   |   |   |   route.ts
|   |   |   |
|   |   |   \---[courseId]
|   |   |       |   route.ts
|   |   |       |
|   |   |       \---progress
|   |   |               route.ts
|   |   |
|   |   +---gamification
|   |   |   |   README.md
|   |   |   |
|   |   |   +---badges
|   |   |   |   \---[userId]
|   |   |   |           route.ts
|   |   |   |
|   |   |   +---complete-course
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---leaderboard
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---post-comment
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---progress
|   |   |   |   |   route.ts
|   |   |   |   |
|   |   |   |   \---[userId]
|   |   |   |           route.ts
|   |   |   |
|   |   |   +---rank
|   |   |   |   \---[userId]
|   |   |   |           route.ts
|   |   |   |
|   |   |   +---read-article
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---stats
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---sync
|   |   |   |   \---[userId]
|   |   |   |           route.ts
|   |   |   |
|   |   |   \---sync-progress
|   |   |           route.ts
|   |   |
|   |   +---profile
|   |   |   +---update
|   |   |   |       route.ts
|   |   |   |
|   |   |   \---[userId]
|   |   |           route.ts
|   |   |
|   |   +---quiz
|   |   |   \---[id]
|   |   |       \---review
|   |   |               route.ts
|   |   |
|   |   +---quizzes
|   |   |   |   README.md
|   |   |   |
|   |   |   \---[id]
|   |   |       |   route.ts
|   |   |       |
|   |   |       +---attempts
|   |   |       |       route.ts
|   |   |       |
|   |   |       \---submit
|   |   |               route.ts
|   |   |
|   |   +---tags
|   |   |   |   route.ts
|   |   |   |
|   |   |   \---[id]
|   |   |           route.ts
|   |   |
|   |   +---upload
|   |   |       route.ts
|   |   |
|   |   \---users
|   |       |   README.md
|   |       |   route.ts
|   |       |
|   |       \---[id]
|   |           |   route.ts
|   |           |
|   |           \---ban
|   |                   route.ts
|   |
|   +---articles
|   |   |   page.tsx
|   |   |   README.md
|   |   |
|   |   \---[slug]
|   |           page.tsx
|   |
|   +---courses
|   |   |   page.tsx
|   |   |   README.md
|   |   |
|   |   \---[id]
|   |       |   page.tsx
|   |       |
|   |       +---learn
|   |       |       page.tsx
|   |       |
|   |       \---review
|   |               page.tsx
|   |
|   +---leaderboard
|   |       page.tsx
|   |       README.md
|   |
|   +---my-articles
|   |   |   page.tsx
|   |   |   README.md
|   |   |
|   |   \---create
|   |           page.tsx
|   |
|   +---my-courses
|   |       page.tsx
|   |       README.md
|   |
|   +---profile
|   |   |   page.tsx
|   |   |   README.md
|   |   |
|   |   \---edit
|   |           page.tsx
|   |
|   \---quiz
|       |   README.md
|       |
|       \---[id]
|           |   page.tsx
|           |
|           \---result
|                   page.tsx
|
+---components
|   |   README.md
|   |
|   +---admin
|   |       ArticleAnalytics.tsx
|   |       CreateTagModal.tsx
|   |       NavigationCard.tsx
|   |       QuickActions.tsx
|   |       README.md
|   |       StatsCard.tsx
|   |       TagsFilter.tsx
|   |       TagsTable.tsx
|   |
|   +---article
|   |       ArticleAccessLoader.tsx
|   |       ArticleCard.tsx
|   |       ArticleDetail.tsx
|   |       ArticleMeta.tsx
|   |       ArticleSelector.tsx
|   |       BlockEditor.tsx
|   |       CategoryFilter.tsx
|   |       CategorySelector.tsx
|   |       README.md
|   |
|   +---common
|   |       Badge.tsx
|   |       Breadcrumb.tsx
|   |       Button.tsx
|   |       Card.tsx
|   |       ConfirmModal.tsx
|   |       DataTable.tsx
|   |       ImageUpload.tsx
|   |       Input.tsx
|   |       Modal.tsx
|   |       PageHeader.tsx
|   |       README.md
|   |       Skeleton.tsx
|   |       Spinner.tsx
|   |       TagInput.tsx
|   |
|   +---course
|   |       ChapterList.tsx
|   |       CodeBlock.tsx
|   |       CourseArticleReader.tsx
|   |       CourseCard.tsx
|   |       CourseCompletionHandler.tsx
|   |       CourseDetail.tsx
|   |       CourseDetailWithGamification.tsx
|   |       CourseSidebar.tsx
|   |       DifficultySelector.tsx
|   |       LessonNavigation.tsx
|   |       README.md
|   |       XPPreview.tsx
|   |
|   +---gamification
|   |       BadgeCard.tsx
|   |       BadgeGrid.tsx
|   |       BadgeList.tsx
|   |       LeaderboardTable.tsx
|   |       LevelBadge.tsx
|   |       LevelUpModal.tsx
|   |       README.md
|   |       RewardToast.tsx
|   |       UserProgressCard.tsx
|   |       XPBar.tsx
|   |       XPProgressBar.tsx
|   |       XPRewardBadge.tsx
|   |
|   +---layout
|   |       Footer.tsx
|   |       Header.tsx
|   |       README.md
|   |       Sidebar.tsx
|   |
|   +---profile
|   |       EditProfileModal.tsx
|   |
|   \---quiz
|           QuestionDisplay.tsx
|           QuizCard.tsx
|           QuizResults.tsx
|           QuizTaker.tsx
|           README.md
|
+---contexts
|       AuthContext.tsx
|       GamificationContext.tsx
|       README.md
|
+---hooks
|       README.md
|       useGamification.ts
|       useViewTracking.ts
|
+---lib
|       auth.ts
|       badge-definitions.ts
|       email.ts
|       gamification-client.ts
|       gamification.ts
|       id-utils.ts
|       mongodb.ts
|       README.md
|       utils.ts
|       view-tracker.ts
|       xp-calculator.ts
|
+---models
|       Article.ts
|       Category.ts
|       Comment.ts
|       Course.ts
|       Enrollment.ts
|       Quiz.ts
|       QuizAttempt.ts
|       README.md
|       Tag.ts
|       TempUser.ts
|       User.ts
|       UserProgress.ts
|
\---types
        index.ts
```
