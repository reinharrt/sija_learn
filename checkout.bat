@echo off
setlocal enabledelayedexpansion

:: Set folder tujuan
set "OUTPUT_DIR=extracted_files"

:: Buat folder tujuan jika belum ada
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo Extracting files to %OUTPUT_DIR%...
echo.

:: Extract files dari src/app/api/admin/
if exist "src\app\api\admin\init-view-tracking\route.ts" copy "src\app\api\admin\init-view-tracking\route.ts" "%OUTPUT_DIR%\api-admin-init-view-tracking-route.ts"

:: Extract files dari src/app/api/auth/
if exist "src\app\api\auth\register\route.ts" copy "src\app\api\auth\register\route.ts" "%OUTPUT_DIR%\api-auth-register-route.ts"
if exist "src\app\api\auth\login\route.ts" copy "src\app\api\auth\login\route.ts" "%OUTPUT_DIR%\api-auth-login-route.ts"
if exist "src\app\api\auth\verify-email\route.ts" copy "src\app\api\auth\verify-email\route.ts" "%OUTPUT_DIR%\api-auth-verify-email-route.ts"
if exist "src\app\api\auth\logout\route.ts" copy "src\app\api\auth\logout\route.ts" "%OUTPUT_DIR%\api-auth-logout-route.ts"

:: Extract files dari src/app/api/articles/
if exist "src\app\api\articles\route.ts" copy "src\app\api\articles\route.ts" "%OUTPUT_DIR%\api-articles-route.ts"
if exist "src\app\api\articles\[id]\route.ts" copy "src\app\api\articles\[id]\route.ts" "%OUTPUT_DIR%\api-articles-[id]-route.ts"
if exist "src\app\api\articles\[slug]\route.ts" copy "src\app\api\articles\[slug]\route.ts" "%OUTPUT_DIR%\api-articles-[slug]-route.ts"

:: Extract files dari src/app/api/courses/
if exist "src\app\api\courses\route.ts" copy "src\app\api\courses\route.ts" "%OUTPUT_DIR%\api-courses-route.ts"
if exist "src\app\api\courses\[id]\route.ts" copy "src\app\api\courses\[id]\route.ts" "%OUTPUT_DIR%\api-courses-[id]-route.ts"

:: Extract files dari src/app/api/enrollments/
if exist "src\app\api\enrollments\route.ts" copy "src\app\api\enrollments\route.ts" "%OUTPUT_DIR%\api-enrollments-route.ts"
if exist "src\app\api\enrollments\[courseId]\route.ts" copy "src\app\api\enrollments\[courseId]\route.ts" "%OUTPUT_DIR%\api-enrollments-[courseId]-route.ts"
if exist "src\app\api\enrollments\[courseId]\progress\route.ts" copy "src\app\api\enrollments\[courseId]\progress\route.ts" "%OUTPUT_DIR%\api-enrollments-[courseId]-progress-route.ts"

:: Extract files dari src/app/api/tags/
if exist "src\app\api\tags\route.ts" copy "src\app\api\tags\route.ts" "%OUTPUT_DIR%\api-tags-route.ts"
if exist "src\app\api\tags\[id]\route.ts" copy "src\app\api\tags\[id]\route.ts" "%OUTPUT_DIR%\api-tags-[id]-route.ts"

:: Extract files dari src/app/api/comments/
if exist "src\app\api\comments\route.ts" copy "src\app\api\comments\route.ts" "%OUTPUT_DIR%\api-comments-route.ts"
if exist "src\app\api\comments\[id]\route.ts" copy "src\app\api\comments\[id]\route.ts" "%OUTPUT_DIR%\api-comments-[id]-route.ts"

:: Extract files dari src/app/api/users/
if exist "src\app\api\users\route.ts" copy "src\app\api\users\route.ts" "%OUTPUT_DIR%\api-users-route.ts"
if exist "src\app\api\users\[id]\route.ts" copy "src\app\api\users\[id]\route.ts" "%OUTPUT_DIR%\api-users-[id]-route.ts"

:: Extract upload route
if exist "src\app\api\upload\route.ts" copy "src\app\api\upload\route.ts" "%OUTPUT_DIR%\api-upload-route.ts"

:: Extract files dari src/app/(auth)/
if exist "src\app\(auth)\login\page.tsx" copy "src\app\(auth)\login\page.tsx" "%OUTPUT_DIR%\auth-login-page.tsx"
if exist "src\app\(auth)\register\page.tsx" copy "src\app\(auth)\register\page.tsx" "%OUTPUT_DIR%\auth-register-page.tsx"
if exist "src\app\(auth)\verify\page.tsx" copy "src\app\(auth)\verify\page.tsx" "%OUTPUT_DIR%\auth-verify-page.tsx"

:: Extract files dari src/app/articles/
if exist "src\app\articles\page.tsx" copy "src\app\articles\page.tsx" "%OUTPUT_DIR%\articles-page.tsx"
if exist "src\app\articles\[slug]\page.tsx" copy "src\app\articles\[slug]\page.tsx" "%OUTPUT_DIR%\articles-[slug]-page.tsx"
if exist "src\app\articles\[slug]\edit\page.tsx" copy "src\app\articles\[slug]\edit\page.tsx" "%OUTPUT_DIR%\articles-[slug]-edit-page.tsx"
if exist "src\app\articles\create\page.tsx" copy "src\app\articles\create\page.tsx" "%OUTPUT_DIR%\articles-create-page.tsx"

:: Extract files dari src/app/my-articles/
if exist "src\app\my-articles\page.tsx" copy "src\app\my-articles\page.tsx" "%OUTPUT_DIR%\my-articles-page.tsx"

:: Extract files dari src/app/courses/
if exist "src\app\courses\page.tsx" copy "src\app\courses\page.tsx" "%OUTPUT_DIR%\courses-page.tsx"
if exist "src\app\courses\[slug]\page.tsx" copy "src\app\courses\[slug]\page.tsx" "%OUTPUT_DIR%\courses-[slug]-page.tsx"
if exist "src\app\courses\[slug]\edit\page.tsx" copy "src\app\courses\[slug]\edit\page.tsx" "%OUTPUT_DIR%\courses-[slug]-edit-page.tsx"
if exist "src\app\courses\create\page.tsx" copy "src\app\courses\create\page.tsx" "%OUTPUT_DIR%\courses-create-page.tsx"

:: Extract files dari src/app/my-courses/
if exist "src\app\my-courses\page.tsx" copy "src\app\my-courses\page.tsx" "%OUTPUT_DIR%\my-courses-page.tsx"

:: Extract files dari src/app/admin/
if exist "src\app\admin\page.tsx" copy "src\app\admin\page.tsx" "%OUTPUT_DIR%\admin-page.tsx"
if exist "src\app\admin\analytics\page.tsx" copy "src\app\admin\analytics\page.tsx" "%OUTPUT_DIR%\admin-analytics-page.tsx"
if exist "src\app\admin\users\page.tsx" copy "src\app\admin\users\page.tsx" "%OUTPUT_DIR%\admin-users-page.tsx"
if exist "src\app\admin\articles\page.tsx" copy "src\app\admin\articles\page.tsx" "%OUTPUT_DIR%\admin-articles-page.tsx"
if exist "src\app\admin\courses\page.tsx" copy "src\app\admin\courses\page.tsx" "%OUTPUT_DIR%\admin-courses-page.tsx"
if exist "src\app\admin\tags\page.tsx" copy "src\app\admin\tags\page.tsx" "%OUTPUT_DIR%\admin-tags-page.tsx"

:: Extract root app files
if exist "src\app\layout.tsx" copy "src\app\layout.tsx" "%OUTPUT_DIR%\app-layout.tsx"
if exist "src\app\page.tsx" copy "src\app\page.tsx" "%OUTPUT_DIR%\app-page.tsx"

:: Extract components - admin
if exist "src\components\admin\ArticleAnalytics.tsx" copy "src\components\admin\ArticleAnalytics.tsx" "%OUTPUT_DIR%\components-admin-ArticleAnalytics.tsx"
if exist "src\components\admin\CreateTagModal.tsx" copy "src\components\admin\CreateTagModal.tsx" "%OUTPUT_DIR%\components-admin-CreateTagModal.tsx"
if exist "src\components\admin\NavigationCard.tsx" copy "src\components\admin\NavigationCard.tsx" "%OUTPUT_DIR%\components-admin-NavigationCard.tsx"
if exist "src\components\admin\QuickActions.tsx" copy "src\components\admin\QuickActions.tsx" "%OUTPUT_DIR%\components-admin-QuickActions.tsx"
if exist "src\components\admin\StatsCard.tsx" copy "src\components\admin\StatsCard.tsx" "%OUTPUT_DIR%\components-admin-StatsCard.tsx"
if exist "src\components\admin\TagsFilter.tsx" copy "src\components\admin\TagsFilter.tsx" "%OUTPUT_DIR%\components-admin-TagsFilter.tsx"
if exist "src\components\admin\TagsTable.tsx" copy "src\components\admin\TagsTable.tsx" "%OUTPUT_DIR%\components-admin-TagsTable.tsx"

:: Extract components - layout
if exist "src\components\layout\Header.tsx" copy "src\components\layout\Header.tsx" "%OUTPUT_DIR%\components-layout-Header.tsx"
if exist "src\components\layout\Footer.tsx" copy "src\components\layout\Footer.tsx" "%OUTPUT_DIR%\components-layout-Footer.tsx"

:: Extract components - article
if exist "src\components\article\ArticleCard.tsx" copy "src\components\article\ArticleCard.tsx" "%OUTPUT_DIR%\components-article-ArticleCard.tsx"
if exist "src\components\article\ArticleDetail.tsx" copy "src\components\article\ArticleDetail.tsx" "%OUTPUT_DIR%\components-article-ArticleDetail.tsx"
if exist "src\components\article\BlockEditor.tsx" copy "src\components\article\BlockEditor.tsx" "%OUTPUT_DIR%\components-article-BlockEditor.tsx"

:: Extract components - course
if exist "src\components\course\CourseArticleReader.tsx" copy "src\components\course\CourseArticleReader.tsx" "%OUTPUT_DIR%\components-course-CourseArticleReader.tsx"
if exist "src\components\course\CourseCard.tsx" copy "src\components\course\CourseCard.tsx" "%OUTPUT_DIR%\components-course-CourseCard.tsx"
if exist "src\components\course\CourseDetail.tsx" copy "src\components\course\CourseDetail.tsx" "%OUTPUT_DIR%\components-course-CourseDetail.tsx"

:: Extract components - comment
if exist "src\components\comment\CommentItem.tsx" copy "src\components\comment\CommentItem.tsx" "%OUTPUT_DIR%\components-comment-CommentItem.tsx"

:: Extract components - common
if exist "src\components\common\Button.tsx" copy "src\components\common\Button.tsx" "%OUTPUT_DIR%\components-common-Button.tsx"
if exist "src\components\common\Input.tsx" copy "src\components\common\Input.tsx" "%OUTPUT_DIR%\components-common-Input.tsx"
if exist "src\components\common\ImageUpload.tsx" copy "src\components\common\ImageUpload.tsx" "%OUTPUT_DIR%\components-common-ImageUpload.tsx"
if exist "src\components\common\TagInput.tsx" copy "src\components\common\TagInput.tsx" "%OUTPUT_DIR%\components-common-TagInput.tsx"

:: Extract contexts
if exist "src\contexts\AuthContext.tsx" copy "src\contexts\AuthContext.tsx" "%OUTPUT_DIR%\contexts-AuthContext.tsx"

:: Extract hooks
if exist "src\hooks\useViewTracking.ts" copy "src\hooks\useViewTracking.ts" "%OUTPUT_DIR%\hooks-useViewTracking.ts"

:: Extract lib files
if exist "src\lib\mongodb.ts" copy "src\lib\mongodb.ts" "%OUTPUT_DIR%\lib-mongodb.ts"
if exist "src\lib\auth.ts" copy "src\lib\auth.ts" "%OUTPUT_DIR%\lib-auth.ts"
if exist "src\lib\email.ts" copy "src\lib\email.ts" "%OUTPUT_DIR%\lib-email.ts"
if exist "src\lib\utils.ts" copy "src\lib\utils.ts" "%OUTPUT_DIR%\lib-utils.ts"
if exist "src\lib\id-utils.ts" copy "src\lib\id-utils.ts" "%OUTPUT_DIR%\lib-id-utils.ts"
if exist "src\lib\view-tracker.ts" copy "src\lib\view-tracker.ts" "%OUTPUT_DIR%\lib-view-tracker.ts"

:: Extract models
if exist "src\models\User.ts" copy "src\models\User.ts" "%OUTPUT_DIR%\models-User.ts"
if exist "src\models\TempUser.ts" copy "src\models\TempUser.ts" "%OUTPUT_DIR%\models-TempUser.ts"
if exist "src\models\Article.ts" copy "src\models\Article.ts" "%OUTPUT_DIR%\models-Article.ts"
if exist "src\models\Course.ts" copy "src\models\Course.ts" "%OUTPUT_DIR%\models-Course.ts"
if exist "src\models\Comment.ts" copy "src\models\Comment.ts" "%OUTPUT_DIR%\models-Comment.ts"
if exist "src\models\Enrollment.ts" copy "src\models\Enrollment.ts" "%OUTPUT_DIR%\models-Enrollment.ts"
if exist "src\models\Tag.ts" copy "src\models\Tag.ts" "%OUTPUT_DIR%\models-Tag.ts"

:: Extract types
if exist "src\types\index.ts" copy "src\types\index.ts" "%OUTPUT_DIR%\types-index.ts"

:: Extract middleware
if exist "src\middleware.ts" copy "src\middleware.ts" "%OUTPUT_DIR%\middleware.ts"

:: Extract config files
if exist ".env.example" copy ".env.example" "%OUTPUT_DIR%\env.example"
if exist "next.config.js" copy "next.config.js" "%OUTPUT_DIR%\next.config.js"
if exist "tsconfig.json" copy "tsconfig.json" "%OUTPUT_DIR%\tsconfig.json"
if exist "tailwind.config.js" copy "tailwind.config.js" "%OUTPUT_DIR%\tailwind.config.js"
if exist "package.json" copy "package.json" "%OUTPUT_DIR%\package.json"

echo.
echo Extraction completed!
echo Files saved to: %OUTPUT_DIR%\
echo.
pause