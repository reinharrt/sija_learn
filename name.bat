@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   INJECT FILE HEADERS TO ALL PROJECT FILES
echo ================================================
echo.

:: ROOT FILES
call :add_header "src\middleware.ts" "Middleware - Request middleware and authentication"

:: APP CORE
call :add_header "src\app\globals.css" "Global Styles - Global CSS styling"
call :add_header "src\app\layout.tsx" "Root Layout - Main application layout"
call :add_header "src\app\page.tsx" "Home Page - Landing page"

:: AUTH PAGES
call :add_header "src\app\(auth)\login\page.tsx" "Login Page - User login interface"
call :add_header "src\app\(auth)\register\page.tsx" "Register Page - User registration interface"
call :add_header "src\app\(auth)\verify\page.tsx" "Verify Page - Email verification interface"

:: ADMIN PAGES
call :add_header "src\app\admin\page.tsx" "Admin Dashboard - Main admin interface"
call :add_header "src\app\admin\articles\page.tsx" "Admin Articles - Manage articles"
call :add_header "src\app\admin\courses\page.tsx" "Admin Courses - Manage courses"
call :add_header "src\app\admin\users\page.tsx" "Admin Users - Manage users"

:: API - AUTH
call :add_header "src\app\api\auth\login\route.ts" "Login API - Handle user authentication"
call :add_header "src\app\api\auth\logout\route.ts" "Logout API - Handle user logout"
call :add_header "src\app\api\auth\register\route.ts" "Register API - Handle user registration"
call :add_header "src\app\api\auth\verify-email\route.ts" "Email Verification API - Verify user email"

:: API - ARTICLES
call :add_header "src\app\api\articles\route.ts" "Articles API - List and create articles"
call :add_header "src\app\api\articles\[id]\route.ts" "Article Detail API - Get, update, delete specific article"

:: API - COURSES
call :add_header "src\app\api\courses\route.ts" "Courses API - List and create courses"
call :add_header "src\app\api\courses\[id]\route.ts" "Course Detail API - Get, update, delete specific course"

:: API - ENROLLMENTS
call :add_header "src\app\api\enrollments\route.ts" "Enrollments API - List user enrollments"
call :add_header "src\app\api\enrollments\[courseId]\route.ts" "Enrollment Detail API - Enroll/unenroll from course"

:: API - COMMENTS
call :add_header "src\app\api\comments\route.ts" "Comments API - List and create comments"
call :add_header "src\app\api\comments\[id]\route.ts" "Comment Detail API - Get, update, delete specific comment"

:: API - USERS
call :add_header "src\app\api\users\route.ts" "Users API - List and manage users"
call :add_header "src\app\api\users\[id]\route.ts" "User Detail API - Get, update, delete specific user"

:: API - UPLOAD
call :add_header "src\app\api\upload\route.ts" "Upload API - Handle file uploads"

:: ARTICLES PAGES
call :add_header "src\app\articles\page.tsx" "Articles List Page - Display all articles"
call :add_header "src\app\articles\create\page.tsx" "Article Create Page - Create new article"
call :add_header "src\app\articles\[slug]\page.tsx" "Article Detail Page - Display single article"
call :add_header "src\app\articles\[slug]\edit\page.tsx" "Article Edit Page - Edit existing article"

:: COURSES PAGES
call :add_header "src\app\courses\page.tsx" "Courses List Page - Display all courses"
call :add_header "src\app\courses\create\page.tsx" "Course Create Page - Create new course"
call :add_header "src\app\courses\[slug]\page.tsx" "Course Detail Page - Display single course"
call :add_header "src\app\courses\[slug]\edit\page.tsx" "Course Edit Page - Edit existing course"

:: USER DASHBOARDS
call :add_header "src\app\my-articles\page.tsx" "My Articles Page - User's articles dashboard"
call :add_header "src\app\my-courses\page.tsx" "My Courses Page - User's enrolled courses dashboard"

:: COMPONENTS - ARTICLE
call :add_header "src\components\article\ArticleCard.tsx" "Article Card Component - Article preview card"
call :add_header "src\components\article\ArticleDetail.tsx" "Article Detail Component - Full article display"
call :add_header "src\components\article\BlockEditor.tsx" "Block Editor Component - Rich text editor for articles"

:: COMPONENTS - COMMENT
call :add_header "src\components\comment\CommentItem.tsx" "Comment Item Component - Single comment display"

:: COMPONENTS - COMMON
call :add_header "src\components\common\Button.tsx" "Button Component - Reusable button"
call :add_header "src\components\common\ImageUpload.tsx" "Image Upload Component - Image upload handler"
call :add_header "src\components\common\Input.tsx" "Input Component - Reusable input field"

:: COMPONENTS - COURSE
call :add_header "src\components\course\CourseCard.tsx" "Course Card Component - Course preview card"
call :add_header "src\components\course\CourseDetail.tsx" "Course Detail Component - Full course display"

:: COMPONENTS - LAYOUT
call :add_header "src\components\layout\Footer.tsx" "Footer Component - Page footer"
call :add_header "src\components\layout\Header.tsx" "Header Component - Navigation header"

:: CONTEXTS
call :add_header "src\contexts\AuthContext.tsx" "Auth Context - Authentication state management"

:: LIB
call :add_header "src\lib\auth.ts" "Auth Utilities - Authentication helper functions"
call :add_header "src\lib\email.ts" "Email Service - Email sending utilities"
call :add_header "src\lib\mongodb.ts" "MongoDB Connection - Database connection utility"
call :add_header "src\lib\utils.ts" "General Utilities - Common helper functions"

:: MODELS
call :add_header "src\models\Article.ts" "Article Model - Article database schema"
call :add_header "src\models\Comment.ts" "Comment Model - Comment database schema"
call :add_header "src\models\Course.ts" "Course Model - Course database schema"
call :add_header "src\models\Enrollment.ts" "Enrollment Model - Course enrollment database schema"
call :add_header "src\models\TempUser.ts" "Temp User Model - Temporary user for email verification"
call :add_header "src\models\User.ts" "User Model - User database schema"

:: TYPES
call :add_header "src\types\index.ts" "Type Definitions - TypeScript type definitions"

echo.
echo ================================================
echo   ALL FILES HAVE BEEN UPDATED!
echo ================================================
echo.
pause
goto :eof

:add_header
set "file_path=%~1"
set "description=%~2"

if exist "!file_path!" (
    echo Processing: !file_path!
    
    :: Get file extension to determine comment style
    set "ext="
    for %%F in ("!file_path!") do set "ext=%%~xF"
    
    :: Create temp file with header
    set "temp_file=!file_path!.tmp"
    
    :: Determine comment style based on extension
    if /i "!ext!"==".css" (
        (
            echo /* ============================================
            echo  * !file_path:\=/!
            echo  * !description!
            echo  * ============================================ */
            echo.
            type "!file_path!"
        ) > "!temp_file!"
    ) else (
        (
            echo // ============================================
            echo // !file_path:\=/!
            echo // !description!
            echo // ============================================
            echo.
            type "!file_path!"
        ) > "!temp_file!"
    )
    
    :: Replace original with temp
    move /y "!temp_file!" "!file_path!" >nul
    
) else (
    echo [SKIP] File not found: !file_path!
)
goto :eof