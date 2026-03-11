import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import axios from "axios";
import { google } from "googleapis";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/fetch-metadata", async (req, res) => {
    const { url, platform } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (platform === "tiktok") {
      try {
        // 1. Get oEmbed data for title and author
        let title = "TikTok Video";
        let author = "";
        
        try {
          const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
          const oembedRes = await axios.get(oembedUrl);
          if (oembedRes.data.title) title = oembedRes.data.title;
          if (oembedRes.data.author_name) author = oembedRes.data.author_name;
        } catch (oembedErr: any) {
          console.error("TikTok oEmbed error:", oembedErr.message);
        }

        // 2. Try to scrape the actual page for stats
        let views = 0;
        let likes = 0;
        let comments = 0;

        try {
          const pageRes = await axios.get(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
            },
            timeout: 5000
          });

          const html = pageRes.data;
          
          // Regex search for stats in the JSON blob or HTML
          const playMatch = html.match(/"playCount":(\d+)/);
          const diggMatch = html.match(/"diggCount":(\d+)/);
          const commentMatch = html.match(/"commentCount":(\d+)/);

          if (playMatch) views = parseInt(playMatch[1], 10);
          if (diggMatch) likes = parseInt(diggMatch[1], 10);
          if (commentMatch) comments = parseInt(commentMatch[1], 10);
        } catch (scrapeError: any) {
          console.error("Failed to scrape TikTok stats:", scrapeError.message);
        }

        const finalTitle = author ? `${author} - ${title}` : title;
        
        res.json({
          title: finalTitle.length > 100 ? finalTitle.substring(0, 97) + "..." : finalTitle,
          views,
          likes,
          comments
        });
      } catch (error: any) {
        console.error("TikTok fetch error:", error.message);
        res.status(500).json({ error: "Failed to fetch TikTok data" });
      }
    } else if (platform === "x") {
      try {
        let title = "X (Twitter) Post";
        let views = 0;
        let likes = 0;
        let comments = 0;
        let author = "";

        try {
          const urlObj = new URL(url);
          if (urlObj.hostname.includes('x.com') || urlObj.hostname.includes('twitter.com')) {
            // Try fxtwitter first (more reliable for views)
            const fxUrl = `https://api.fxtwitter.com${urlObj.pathname}`;
            try {
              const fxRes = await axios.get(fxUrl, { timeout: 5000 });
              if (fxRes.data && fxRes.data.tweet) {
                const tweet = fxRes.data.tweet;
                if (tweet.text) title = tweet.text;
                if (tweet.author && tweet.author.name) author = tweet.author.name;
                if (tweet.likes !== undefined) likes = parseInt(tweet.likes, 10) || 0;
                if (tweet.replies !== undefined) comments = parseInt(tweet.replies, 10) || 0;
                if (tweet.views !== undefined && tweet.views !== null) views = parseInt(tweet.views, 10) || 0;
              }
            } catch (fxErr) {
              console.error("fxtwitter error, falling back to vxtwitter:", (fxErr as Error).message);
              // Fallback to vxtwitter
              const vxUrl = `https://api.vxtwitter.com${urlObj.pathname}`;
              const vxRes = await axios.get(vxUrl, { timeout: 5000 });
              
              if (vxRes.data) {
                if (vxRes.data.text) title = vxRes.data.text;
                if (vxRes.data.user_name) author = vxRes.data.user_name;
                if (vxRes.data.likes !== undefined) likes = parseInt(vxRes.data.likes, 10) || 0;
                if (vxRes.data.replies !== undefined) comments = parseInt(vxRes.data.replies, 10) || 0;
                
                if (vxRes.data.views !== undefined) views = parseInt(vxRes.data.views, 10) || 0;
                else if (vxRes.data.impressions !== undefined) views = parseInt(vxRes.data.impressions, 10) || 0;
                else if (vxRes.data.view_count !== undefined) views = parseInt(vxRes.data.view_count, 10) || 0;
              }
            }
          }
        } catch (err: any) {
          console.error("X API error:", err.message);
          // Fallback to official oEmbed if both fail
          try {
            const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
            const oembedRes = await axios.get(oembedUrl, { timeout: 5000 });
            if (oembedRes.data.author_name) author = oembedRes.data.author_name;
            if (oembedRes.data.html) {
              const textMatch = oembedRes.data.html.match(/<p[^>]*>(.*?)<\/p>/);
              if (textMatch && textMatch[1]) {
                title = textMatch[1].replace(/<[^>]*>?/gm, '');
              }
            }
          } catch (oembedErr: any) {
            console.error("X oEmbed error:", oembedErr.message);
          }
        }

        const finalTitle = author ? `${author} - ${title}` : title;
        res.json({
          title: finalTitle.length > 100 ? finalTitle.substring(0, 97) + "..." : finalTitle,
          views,
          likes,
          comments
        });
      } catch (error: any) {
        console.error("X fetch error:", error.message);
        res.status(500).json({ error: "Failed to fetch X data" });
      }
    } else if (platform === "youtube") {
      try {
        let title = "YouTube Video";
        let author = "";
        let views = 0;
        let likes = 0;
        let comments = 0;

        // Try YouTube Data API first if key is available
        if (process.env.YOUTUBE_API_KEY) {
          try {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
            const match = url.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;

            if (videoId) {
              const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
              const response = await youtube.videos.list({ part: ['snippet', 'statistics'], id: [videoId] });
              
              if (response.data.items && response.data.items.length > 0) {
                const video = response.data.items[0];
                title = video.snippet?.title || title;
                author = video.snippet?.channelTitle || author;
                views = parseInt(video.statistics?.viewCount || '0', 10);
                likes = parseInt(video.statistics?.likeCount || '0', 10);
                comments = parseInt(video.statistics?.commentCount || '0', 10);
              }
            }
          } catch (apiErr: any) {
            console.error("YouTube API error:", apiErr.message);
          }
        }

        // Fallback to oEmbed if title is still default
        if (title === "YouTube Video") {
          try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const oembedRes = await axios.get(oembedUrl);
            if (oembedRes.data.title) title = oembedRes.data.title;
            if (oembedRes.data.author_name) author = oembedRes.data.author_name;
          } catch (err: any) {
            console.error("YouTube oEmbed error:", err.message);
          }
        }

        const finalTitle = author ? `${author} - ${title}` : title;
        res.json({
          title: finalTitle.length > 100 ? finalTitle.substring(0, 97) + "..." : finalTitle,
          views,
          likes,
          comments
        });
      } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch YouTube data" });
      }
    } else if (platform === "instagram") {
      try {
        let title = "Instagram Post";
        let views = 0;
        let likes = 0;
        let comments = 0;
        let ownerId = "";
        let shortcode = "";
        let debugSource = "none";

        try {
          // Using instagram-looter2 from RapidAPI
          const options = {
            method: 'GET',
            url: 'https://instagram-looter2.p.rapidapi.com/post',
            params: { url: url },
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '1e492088c3msh36ba0d59dedf5a7p1b7467jsnc6a3c896dd38',
              'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com'
            }
          };
          const response = await axios.request(options);
          const data = response.data;
          
          // Defensive parsing for various common Instagram API response structures
          const postData = data.data || data.items?.[0] || data.graphql?.shortcode_media || data;

          if (postData) {
            ownerId = postData.owner?.id || postData.user?.pk || "";
            shortcode = postData.shortcode || postData.code || "";

            // Extract Caption/Title
            const captionText = postData.caption?.text || 
                                postData.edge_media_to_caption?.edges?.[0]?.node?.text || 
                                postData.text || 
                                (typeof postData.caption === 'string' ? postData.caption : null);
            if (captionText) title = captionText;

            // Extract Likes
            likes = postData.like_count ?? 
                    postData.edge_media_preview_like?.count ?? 
                    postData.likes ?? 0;

            // Extract Comments
            comments = postData.comment_count ?? 
                       postData.edge_media_to_parent_comment?.count ?? 
                       postData.edge_media_to_comment?.count ?? 
                       postData.comments ?? 0;

            // Extract Views (only present on videos usually)
            views = postData.view_count ?? 
                    postData.video_view_count ?? 
                    postData.play_count ?? 
                    postData.views ?? 
                    postData.playCount ??
                    postData.viewCount ?? 0;
            
            debugSource = "rapidapi_post";
          }
        } catch (apiErr: any) {
          console.error("RapidAPI Instagram error:", apiErr.message);
        }

        // If it's a reel, try the /reels endpoint to get the most accurate play_count
        if (url.includes('/reel/') && ownerId && shortcode) {
          try {
            const reelsRes = await axios.get('https://instagram-looter2.p.rapidapi.com/reels', {
              headers: {
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || '1e492088c3msh36ba0d59dedf5a7p1b7467jsnc6a3c896dd38',
                "X-RapidAPI-Host": "instagram-looter2.p.rapidapi.com",
              },
              params: { id: ownerId },
            });
            
            if (reelsRes.data && reelsRes.data.items) {
              const matchingReel = reelsRes.data.items.find((item: any) => item.media?.code === shortcode);
              if (matchingReel && matchingReel.media) {
                const realViews = matchingReel.media.play_count ?? matchingReel.media.view_count;
                if (realViews !== undefined && realViews !== null) {
                  views = realViews;
                  debugSource = "rapidapi_reels";
                }
                const realLikes = matchingReel.media.like_count;
                if (realLikes !== undefined && realLikes !== null) {
                  likes = realLikes;
                }
                const realComments = matchingReel.media.comment_count;
                if (realComments !== undefined && realComments !== null) {
                  comments = realComments;
                }
              }
            }
          } catch (reelsErr: any) {
            console.error("RapidAPI Instagram Reels error:", reelsErr.message);
          }
        }

        // Fallback to basic scrape if RapidAPI fails or views are 0
        try {
          const pageRes = await axios.get(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            },
            timeout: 5000
          });
          
          const html = pageRes.data;
          
          if (title === "Instagram Post") {
            const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
            if (titleMatch && titleMatch[1]) {
              title = titleMatch[1];
            }
          }
          
          if (views === 0) {
            const viewMatch = html.match(/"video_view_count":(\d+)/) || 
                              html.match(/"play_count":(\d+)/) ||
                              html.match(/"view_count":(\d+)/);
            if (viewMatch && viewMatch[1]) {
              views = parseInt(viewMatch[1], 10);
              debugSource = "html_scrape";
            }
          }
          
          if (likes === 0) {
            const likeMatch = html.match(/"edge_media_preview_like":{"count":(\d+)/) || 
                              html.match(/"like_count":(\d+)/);
            if (likeMatch && likeMatch[1]) {
              likes = parseInt(likeMatch[1], 10);
            }
          }
          
          if (comments === 0) {
            const commentMatch = html.match(/"edge_media_to_comment":{"count":(\d+)/) || 
                                 html.match(/"comment_count":(\d+)/);
            if (commentMatch && commentMatch[1]) {
              comments = parseInt(commentMatch[1], 10);
            }
          }
        } catch (err: any) {
          console.error("Instagram scrape error:", err.message);
        }

        res.json({
          title: title.length > 100 ? title.substring(0, 97) + "..." : title,
          views,
          likes,
          comments,
          debugSource
        });
      } catch (error: any) {
        console.error("Instagram fetch error:", error.message);
        res.status(500).json({ error: "Failed to fetch Instagram data" });
      }
    } else if (platform === "coinmarketcap") {
      try {
        let title = "CoinMarketCap Post";
        let views = 0;
        let likes = 0;
        let comments = 0;

        const pageRes = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          },
          timeout: 5000
        });
        
        const html = pageRes.data;
        
        // Extract post ID from URL
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const postId = pathParts[pathParts.length - 1];
        
        // Try to find the specific post data using regex
        const postRegex = new RegExp(`"gravityId"\\s*:\\s*"${postId}"[\\s\\S]*?"commentCount"\\s*:\\s*"(\\d+)"[\\s\\S]*?"likeCount"\\s*:\\s*"(\\d+)"`, 'i');
        const postMatch = html.match(postRegex);
        
        if (postMatch) {
          comments = parseInt(postMatch[1], 10);
          likes = parseInt(postMatch[2], 10);
        }
        
        // Try to find impressions (views)
        const impressionRegex = new RegExp(`"gravityId"\\s*:\\s*"${postId}"[\\s\\S]*?"impressionCount"\\s*:\\s*"(\\d+)"`, 'i');
        const impressionMatch = html.match(impressionRegex);
        
        if (impressionMatch) {
          views = parseInt(impressionMatch[1], 10);
        }
        
        // Try to get a title
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].replace(' | CoinMarketCap', '').trim();
        }

        res.json({
          title: title.length > 100 ? title.substring(0, 97) + "..." : title,
          views,
          likes,
          comments
        });
      } catch (error: any) {
        console.error("CoinMarketCap fetch error:", error.message);
        res.status(500).json({ error: "Failed to fetch CoinMarketCap data" });
      }
    } else {
      // Fallback for other platforms
      res.json({ title: "New Upload", views: 0, likes: 0, comments: 0 });
    }
  });

  app.post("/api/refresh-stats", async (req, res) => {
    // In a real application, this endpoint would:
    // 1. Authenticate the request (e.g., verify Firebase token)
    // 2. Fetch the content URLs from Firestore
    // 3. Call the respective APIs (YouTube Data API, Instagram Graph API, TikTok API)
    // 4. Update the Firestore documents with the new stats
    // Since we don't have the API keys configured, we'll return a success message
    // indicating where the integration should happen.
    
    // Example YouTube API call structure:
    // const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
    // const response = await youtube.videos.list({ part: ['statistics'], id: [videoId] });
    // const stats = response.data.items[0].statistics;

    res.json({ 
      status: "success", 
      message: "Stats refresh triggered. Configure API keys in .env to enable real data fetching." 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
