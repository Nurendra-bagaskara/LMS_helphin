import { fetch } from "bun";

async function getChapters(videoId: string) {
    console.log("Fetching", videoId);
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await res.text();
    
    const macroIndex = html.indexOf("macroMarkers");
    console.log("macroMarkers index:", macroIndex);
    
    if (macroIndex !== -1) {
        console.log("FOUND MACROMARKERS");
    } else {
        console.log("macroMarkers NOT FOUND");
    }

    // Try finding "shortDescription"
    const descMatch = html.match(/"shortDescription":"(.*?)"/);
    if (descMatch) {
        console.log("Found description length:", descMatch[1].length);
        const desc = descMatch[1].replace(/\\n/g, "\n");
        // Regex for chapters in description: MM:SS or HH:MM:SS followed by title
        const regex = /(?:^|\n)((\d{1,2}:)?\d{2}:\d{2})\s+(.+)/g;
        let match;
        const chapters = [];
        while ((match = regex.exec(desc)) !== null) {
            chapters.push({
                time: match[1],
                title: match[3].trim()
            });
        }
        console.log("Chapters from description:", chapters);
    }
}

getChapters("b3dxMwIO-yM");
