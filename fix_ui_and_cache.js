const fs = require('fs');

// 1. Fix signature color (from white to black/ink)
const pageFile = 'src/app/(customer)/dashboard/verification/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');
pageContent = pageContent.replace('ctx.strokeStyle = "#fff";', 'ctx.strokeStyle = "#1f1a16";');
fs.writeFileSync(pageFile, pageContent);
console.log('Fixed signature color');

// 2. Add revalidatePath to Agreement route
const agreementFile = 'src/app/api/host/verification/agreement/route.ts';
let agreementContent = fs.readFileSync(agreementFile, 'utf8');
if (!agreementContent.includes('revalidatePath')) {
    agreementContent = agreementContent.replace('import { NextResponse } from "next/server";', 'import { NextResponse } from "next/server";\nimport { revalidatePath } from "next/cache";');
    agreementContent = agreementContent.replace('return NextResponse.json({ success: true, redirectUrl: "/dashboard" });', 'revalidatePath("/", "layout");\n    return NextResponse.json({ success: true, redirectUrl: "/dashboard" });');
    fs.writeFileSync(agreementFile, agreementContent);
    console.log('Added revalidatePath to Agreement route');
}

// 3. Add revalidatePath to Handle route
const handleFile = 'src/app/api/user/handle/route.ts';
let handleContent = fs.readFileSync(handleFile, 'utf8');
if (!handleContent.includes('revalidatePath')) {
    handleContent = handleContent.replace('import { NextResponse } from "next/server";', 'import { NextResponse } from "next/server";\nimport { revalidatePath } from "next/cache";');
    handleContent = handleContent.replace('return NextResponse.json({\n      success: true,\n      url: `${getAppUrl()}/@${handle}`,\n    });', 'revalidatePath("/", "layout");\n    return NextResponse.json({\n      success: true,\n      url: `${getAppUrl()}/@${handle}`,\n    });');
    fs.writeFileSync(handleFile, handleContent);
    console.log('Added revalidatePath to Handle route');
}

