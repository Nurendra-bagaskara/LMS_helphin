import os
import re

files_to_fix = [
    r"d:\telyu\Semester6\Helphin\LMS2\frontend\app\admin\(dashboard)\dashboard\page.tsx",
    r"d:\telyu\Semester6\Helphin\LMS2\frontend\app\admin\(dashboard)\mata-kuliah\page.tsx",
    r"d:\telyu\Semester6\Helphin\LMS2\frontend\app\admin\(dashboard)\mata-kuliah\[id]\page.tsx",
    r"d:\telyu\Semester6\Helphin\LMS2\frontend\app\admin\(dashboard)\mata-kuliah\[id]\video\[videoId]\page.tsx",
    r"d:\telyu\Semester6\Helphin\LMS2\frontend\app\admin\(dashboard)\mata-kuliah\[id]\materi\[materiId]\page.tsx",
    r"d:\telyu\Semester6\Helphin\LMS2\frontend\app\admin\(dashboard)\mata-kuliah\[id]\bank-soal\[soalId]\page.tsx",
    r"d:\telyu\Semester6\Helphin\LMS2\frontend\app\admin\(dashboard)\mata-kuliah\[id]\quiz\[quizId]\page.tsx",
    r"d:\telyu\Semester6\Helphin\LMS2\frontend\app\admin\(dashboard)\pusat-layanan\page.tsx",
]

replacements = {
    # Backgrounds
    r"\bbg-white(?!\s+dark:)": "bg-white dark:bg-slate-900",
    r"\bbg-gray-50(?!\s+dark:)": "bg-gray-50 dark:bg-slate-800/50",
    r"\bbg-slate-50(?!\s+dark:)(?!/)": "bg-slate-50 dark:bg-slate-800/50",
    r"\bbg-slate-100(?!\s+dark:)": "bg-slate-100 dark:bg-slate-800",
    r"\bbg-slate-800(?!\s+dark:)": "bg-slate-800 dark:bg-slate-900",
    r"\bbg-\[\#F8FBFF\](?!\s+dark:)": "bg-[#F8FBFF] dark:bg-slate-950",
    r"\bbg-\[\#F8FAFC\](?!\s+dark:)": "bg-[#F8FAFC] dark:bg-slate-950",
    
    # Texts
    r"\btext-gray-900(?!\s+dark:)": "text-gray-900 dark:text-slate-100",
    r"\btext-gray-800(?!\s+dark:)": "text-gray-800 dark:text-slate-100",
    r"\btext-gray-700(?!\s+dark:)": "text-gray-700 dark:text-slate-200",
    r"\btext-gray-600(?!\s+dark:)": "text-gray-600 dark:text-slate-300",
    r"\btext-gray-500(?!\s+dark:)": "text-gray-500 dark:text-slate-400",
    r"\btext-gray-400(?!\s+dark:)": "text-gray-400 dark:text-slate-500",
    
    r"\btext-slate-900(?!\s+dark:)": "text-slate-900 dark:text-slate-100",
    r"\btext-slate-800(?!\s+dark:)": "text-slate-800 dark:text-slate-100",
    r"\btext-slate-700(?!\s+dark:)": "text-slate-700 dark:text-slate-200",
    r"\btext-slate-600(?!\s+dark:)": "text-slate-600 dark:text-slate-300",
    r"\btext-slate-500(?!\s+dark:)": "text-slate-500 dark:text-slate-400",
    r"\btext-slate-400(?!\s+dark:)": "text-slate-400 dark:text-slate-500",

    # Borders
    r"\bborder-gray-50(?!\s+dark:)": "border-gray-50 dark:border-slate-800/50",
    r"\bborder-gray-100(?!\s+dark:)": "border-gray-100 dark:border-slate-800",
    r"\bborder-gray-200(?!\s+dark:)": "border-gray-200 dark:border-slate-700",
    
    r"\bborder-slate-50(?!\s+dark:)": "border-slate-50 dark:border-slate-800/50",
    r"\bborder-slate-100(?!\s+dark:)": "border-slate-100 dark:border-slate-800",
    r"\bborder-slate-200(?!\s+dark:)": "border-slate-200 dark:border-slate-700",

    # Shadows (optional tweak to reduce glaring white shadows in dark mode)
    r"\bshadow-sm(?!\s+dark:)": "shadow-sm dark:shadow-none",
    r"\bshadow-md(?!\s+dark:)": "shadow-md dark:shadow-none",
    r"\bshadow-lg(?!\s+dark:)": "shadow-lg dark:shadow-none",
    
    # Specific dashboard layout ones
    r"\bbg-\[\#E3F2FF\](?!\s+dark:)": "bg-[#E3F2FF] dark:bg-blue-900/20",
}

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        new_content = content
        for pattern, replacement in replacements.items():
            new_content = re.sub(pattern, replacement, new_content)

        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated: {filepath}")
        else:
            print(f"No changes needed: {filepath}")
    else:
        print(f"File not found: {filepath}")

