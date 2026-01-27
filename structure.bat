@echo off
setlocal enabledelayedexpansion

echo.
echo ================================================
echo   SIJA-LEARN PROJECT STRUCTURE CHECKER
echo ================================================
echo.

set "TOTAL=0"
set "FOUND=0"
set "MISSING=0"

echo Checking project structure...
echo.

:: API Routes - Auth
echo [API - Auth]
call :check_file "src\app\api\auth\register\route.ts"
call :check_file "src\app\api\auth\login\route.ts"
call :check_file "src\app\api\auth\verify-email\route.ts"
call :check_file "src\app\api\auth\logout\route.ts"
echo.

:: API Routes - Articles
echo [API - Articles]
call :check_file "src\app\api\articles\route.ts"
call :check_file "src\app\api\articles\[id]\route.ts"
echo.

:: API Routes - Courses
echo [API - Courses]
call :check_file "src\app\api\courses\route.ts"
call :check_file "src\app\api\courses\[id]\route.ts"
echo.

:: API Routes - Enrollments
echo [API - Enrollments]
call :check_file "src\app\api\enrollments\route.ts"
call :check_file "src\app\api\enrollments\[courseId]\route.ts"
echo.

:: API Routes - Comments
echo [API - Comments]
call :check_file "src\app\api\comments\route.ts"
call :check_file "src\app\api\comments\[id]\route.ts"
echo.

:: API Routes - Users
echo [API - Users]
call :check_file "src\app\api\users\route.ts"
call :check_file "src\app\api\users\[id]\route.ts"
echo.

:: API Routes - Upload
echo [API - Upload]
call :check_file "src\app\api\upload\route.ts"
echo.

:: Auth Pages
echo [Pages - Auth]
call :check_file "src\app\^(auth^)\login\page.tsx"
call :check_file "src\app\^(auth^)\register\page.tsx"
call :check_file "src\app\^(auth^)\verify\page.tsx"
echo.

:: Articles Pages
echo [Pages - Articles]
call :check_file "src\app\articles\page.tsx"
call :check_file "src\app\articles\[slug]\page.tsx"
call :check_file "src\app\articles\[slug]\edit\page.tsx"
call :check_file "src\app\articles\create\page.tsx"
call :check_file "src\app\my-articles\page.tsx"
echo.

:: Courses Pages
echo [Pages - Courses]
call :check_file "src\app\courses\page.tsx"
call :check_file "src\app\courses\[slug]\page.tsx"
call :check_file "src\app\courses\[slug]\edit\page.tsx"
call :check_file "src\app\courses\create\page.tsx"
call :check_file "src\app\my-courses\page.tsx"
echo.

:: Admin Pages
echo [Pages - Admin]
call :check_file "src\app\admin\page.tsx"
call :check_file "src\app\admin\users\page.tsx"
call :check_file "src\app\admin\articles\page.tsx"
call :check_file "src\app\admin\courses\page.tsx"
echo.

:: Root App Files
echo [App Root]
call :check_file "src\app\layout.tsx"
call :check_file "src\app\page.tsx"
echo.

:: Components - Layout
echo [Components - Layout]
call :check_file "src\components\layout\Header.tsx"
call :check_file "src\components\layout\Footer.tsx"
echo.

:: Components - Article
echo [Components - Article]
call :check_file "src\components\article\ArticleCard.tsx"
call :check_file "src\components\article\ArticleDetail.tsx"
call :check_file "src\components\article\BlockEditor.tsx"
echo.

:: Components - Course
echo [Components - Course]
call :check_file "src\components\course\CourseCard.tsx"
call :check_file "src\components\course\CourseDetail.tsx"
echo.

:: Components - Comment
echo [Components - Comment]
call :check_file "src\components\comment\CommentItem.tsx"
echo.

:: Components - Common
echo [Components - Common]
call :check_file "src\components\common\Button.tsx"
call :check_file "src\components\common\Input.tsx"
call :check_file "src\components\common\ImageUpload.tsx"
echo.

:: Contexts
echo [Contexts]
call :check_file "src\contexts\AuthContext.tsx"
echo.

:: Lib Files
echo [Lib]
call :check_file "src\lib\mongodb.ts"
call :check_file "src\lib\auth.ts"
call :check_file "src\lib\email.ts"
call :check_file "src\lib\utils.ts"
echo.

:: Models
echo [Models]
call :check_file "src\models\User.ts"
call :check_file "src\models\TempUser.ts"
call :check_file "src\models\Article.ts"
call :check_file "src\models\Course.ts"
call :check_file "src\models\Comment.ts"
call :check_file "src\models\Enrollment.ts"
echo.

:: Types
echo [Types]
call :check_file "src\types\index.ts"
echo.

:: Middleware
echo [Middleware]
call :check_file "src\middleware.ts"
echo.

:: Config Files
echo [Config Files]
call :check_file ".env.example"
call :check_file "next.config.js"
call :check_file "tsconfig.json"
call :check_file "tailwind.config.js"
call :check_file "package.json"
echo.

:: Summary
echo ================================================
echo   SUMMARY
echo ================================================
echo Total files checked: %TOTAL%
echo Found: %FOUND% files
echo Missing: %MISSING% files
echo ================================================
echo.

if %MISSING% equ 0 (
    echo [32mAll files are present! Project structure is complete.[0m
) else (
    echo [33mWarning: Some files are missing. Please check above.[0m
)

echo.
pause
goto :eof

:check_file
setlocal
set "file_path=%~1"
set /a TOTAL+=1

if exist "%file_path%" (
    echo [32m✓[0m %file_path%
    set /a FOUND+=1
) else (
    echo [31m✗[0m %file_path%
    set /a MISSING+=1
)
endlocal & set /a TOTAL=%TOTAL% & set /a FOUND=%FOUND% & set /a MISSING=%MISSING%
goto :eof