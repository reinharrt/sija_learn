// Script untuk memperbaiki semua file quiz API
// Mengganti next-auth dengan getUserFromRequest

const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/app/api/admin/quizzes/[id]/assign/route.ts',
    'src/app/api/admin/quizzes/[id]/analytics/route.ts',
    'src/app/api/admin/courses/[id]/quizzes/route.ts',
    'src/app/api/quizzes/[id]/route.ts',
    'src/app/api/quizzes/[id]/submit/route.ts',
    'src/app/api/quizzes/[id]/attempts/route.ts',
];

const replacements = [
    {
        from: /import { getServerSession } from 'next-auth';/g,
        to: ''
    },
    {
        from: /import { authOptions } from '@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route';/g,
        to: ''
    },
    {
        from: /import { getUserFromRequest, hasPermission } from '@\/lib\/auth';\nimport/g,
        to: 'import { getUserFromRequest, hasPermission } from \'@/lib/auth\';\nimport'
    },
    {
        from: /const session = await getServerSession\(authOptions\);[\s\S]*?if \(!session\?\.user\) {[\s\S]*?}\s*if \(session\.user\.role !== UserRole\.ADMIN && session\.user\.role !== UserRole\.COURSE_ADMIN\) {[\s\S]*?}/g,
        to: `const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!hasPermission(user.role, UserRole.COURSE_ADMIN)) {
      return NextResponse.json(
        { error: 'Forbidden: Course Admin required' },
        { status: 403 }
      );
    }`
    },
    {
        from: /session\.user\.id/g,
        to: 'user.id'
    }
];

console.log('Fixing quiz API files...');

filesToFix.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);

    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        replacements.forEach(({ from, to }) => {
            content = content.replace(from, to);
        });

        // Add import if not present
        if (!content.includes('getUserFromRequest')) {
            content = content.replace(
                /import { NextRequest, NextResponse } from 'next\/server';/,
                `import { NextRequest, NextResponse } from 'next/server';\nimport { getUserFromRequest, hasPermission } from '@/lib/auth';`
            );
        }

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✓ Fixed: ${file}`);
    } else {
        console.log(`✗ Not found: ${file}`);
    }
});

console.log('Done!');
