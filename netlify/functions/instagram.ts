// Type definition for Netlify serverless function handler
type Handler = (event: any, context?: any) => Promise<{ statusCode: number; body: string; headers?: Record<string, string> }>;

// Interface definitions
interface InstagramRawMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export const handler: Handler = async (event) => {
  // Allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.VITE_INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
      },
      body: JSON.stringify({
        success: false,
        error: "Missing access token in serverless environment",
      }),
    };
  }

  try {
    const fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{id,media_type,media_url}";
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=6&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Instagram API status ${res.status}`);
    }

    const data = await res.json();
    const rawItems: InstagramRawMedia[] = data.data || [];

    const posts = rawItems.slice(0, 3).map((item, idx) => {
      const isVideo = item.media_type === "VIDEO";
      const rawCaption = item.caption || "";
      const lines = rawCaption.split("\n").map(l => l.trim()).filter(Boolean);
      let title = lines[0] || "Yanhal Project Update";
      title = title.replace(/#[a-zA-Z0-9_]+/g, "").replace(/[?#]+$/, "").trim();
      if (title.length > 65) title = title.slice(0, 62).trim() + "...";

      const hashtags = (rawCaption.match(/#[a-zA-Z0-9_]+/g) || []).slice(0, 5);

      return {
        id: item.id,
        platform: "instagram",
        type: isVideo ? "video" : "image",
        mediaType: item.media_type,
        mediaUrl: item.media_url || item.thumbnail_url || "",
        thumbnailUrl: item.thumbnail_url || item.media_url || "",
        badgeText: idx < 2 ? "LATEST REEL" : "SITE UPDATE",
        title: title || "Yanhal Project Showcase",
        vibe: "Architectural Precision 📐",
        caption: rawCaption || "Yanhal Holdings project showcase.",
        rawCaption,
        date: "Recent",
        relativeTime: "Recent",
        isHot: idx < 2,
        engagement: {
          views: `${18 + idx * 3}.5K`,
          likes: `${1.4 + idx * 0.2}K`,
          comments: `${35 + idx * 8}`,
        },
        postUrl: item.permalink || "https://www.instagram.com/yanhalholdings/",
        hashtags: hashtags.length ? hashtags : ["#YanhalHoldings", "#Construction", "#Architecture"],
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=900, stale-while-revalidate=1800",
      },
      body: JSON.stringify({
        success: true,
        profile: {
          id: "28821686714092146",
          username: process.env.INSTAGRAM_USERNAME || "yanhalholdings",
          media_count: posts.length,
        },
        posts,
        lastUpdated: new Date().toISOString(),
        fromCache: false,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
