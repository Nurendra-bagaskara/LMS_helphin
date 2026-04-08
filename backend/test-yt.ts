import { fetch } from "bun";

async function getChapters(videoId: string) {
    console.log("Fetching", videoId);
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await res.text();
    
    // Attempt 1: ytInitialData
    const match = html.match(/ytInitialData = (\{.*?\});<\/script>/);
    if (!match) {
        console.log("No ytInitialData found");
        return;
    }
    
    try {
        const data = JSON.parse(match[1]);
        const playerOverlays = data?.playerOverlays?.playerOverlayRenderer;
        const markersMap = playerOverlays?.decoratedPlayerBarRenderer?.decoratedPlayerBarRenderer?.playerBar?.multiMarkersPlayerBarRenderer?.markersMap;
        
        if (markersMap) {
            for (const map of markersMap) {
                if (map.key === "MACRO_MARKERS_LIST" || map.key === "DESCRIPTION_CHAPTERS") {
                    const markers = map.value?.chapters || [];
                    for (const marker of markers) {
                        const chapter = marker?.chapterRenderer;
                        if (chapter) {
                            console.log({
                                time: chapter.timeRangeStartMillis,
                                title: chapter.title?.simpleText
                            });
                        }
                    }
                }
            }
        } else {
            console.log("No markers map found in ytInitialData");
        }
    } catch (e) {
        console.error(e);
    }
}

// A video with chapters (e.g. video with chapters in description)
// Let's use a known video with chapters: "b3dxMwIO-yM" or "yXwXk_d1808"
getChapters("b3dxMwIO-yM");
