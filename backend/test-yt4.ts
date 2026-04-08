import { fetch } from "bun";

async function getChapters(videoId: string) {
    console.log("Fetching", videoId);
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    });
    const html = await res.text();
    
    // Attempt to extract ytInitialData
    const dataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
    if (!dataMatch) {
         console.log("no ytInitialData");
         return;
    }
    
    try {
        const data = JSON.parse(dataMatch[1]);
        const chapters = data?.playerOverlays?.playerOverlayRenderer?.decoratedPlayerBarRenderer?.decoratedPlayerBarRenderer?.playerBar?.multiMarkersPlayerBarRenderer?.markersMap?.[0]?.value?.chapters;
        if (chapters) {
            const parsed = chapters.map((c: any) => ({
                title: c.chapterRenderer.title.simpleText,
                timeMillis: c.chapterRenderer.timeRangeStartMillis
            }));
            console.log(parsed);
        } else {
            console.log("No chapters found in standard path");
        }
    } catch(e) {
        console.log(e);
    }
}

// b3dxMwIO-yM
getChapters("b3dxMwIO-yM");
