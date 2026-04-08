import { fetch } from "bun";
async function testAPI() {
    const res = await fetch("https://yt.lemnoslife.com/videos?part=chapters&id=b3dxMwIO-yM");
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
testAPI();
