import fs from 'fs';

function extractData() {
  const html = fs.readFileSync('cmc.html', 'utf-8');
  
  // Try to find the JSON state embedded in the page
  const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/);
  if (stateMatch) {
    console.log("Found __INITIAL_STATE__");
    const state = JSON.parse(stateMatch[1]);
    console.log(Object.keys(state));
  } else {
    console.log("No __INITIAL_STATE__ found");
  }
  
  // Try to find any JSON that contains our post ID
  const jsonMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
  if (jsonMatches) {
    for (const match of jsonMatches) {
      if (match.includes('374386254') && match.includes('{')) {
        console.log("Found script with post ID");
        // Try to extract just the JSON part if it's an assignment
        const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        
        // Let's just look for specific patterns in the raw HTML
        const viewMatch = jsonContent.match(/"viewCount"\s*:\s*"?(\d+)"?/i) || 
                          jsonContent.match(/"views"\s*:\s*"?(\d+)"?/i);
        if (viewMatch) console.log("Found views in script:", viewMatch[1]);
        
        const likeMatch = jsonContent.match(/"likeCount"\s*:\s*"?(\d+)"?/i) || 
                          jsonContent.match(/"likes"\s*:\s*"?(\d+)"?/i);
        if (likeMatch) console.log("Found likes in script:", likeMatch[1]);
        
        const commentMatch = jsonContent.match(/"replyCount"\s*:\s*"?(\d+)"?/i) || 
                             jsonContent.match(/"commentCount"\s*:\s*"?(\d+)"?/i);
        if (commentMatch) console.log("Found comments in script:", commentMatch[1]);
      }
    }
  }
  
  // Direct regex on the whole HTML for the specific post
  console.log("--- Direct HTML Regex ---");
  const postRegex = /"gravityId"\s*:\s*"374386254"[\s\S]*?"commentCount"\s*:\s*"(\d+)"[\s\S]*?"likeCount"\s*:\s*"(\d+)"/i;
  const postMatch = html.match(postRegex);
  if (postMatch) {
    console.log("Direct match found!");
    console.log("Comments:", postMatch[1]);
    console.log("Likes:", postMatch[2]);
  }
  
  // Let's look for impressionCount which is often used for views
  const impressionRegex = /"gravityId"\s*:\s*"374386254"[\s\S]*?"impressionCount"\s*:\s*"(\d+)"/i;
  const impressionMatch = html.match(impressionRegex);
  if (impressionMatch) {
    console.log("Impression count (views):", impressionMatch[1]);
  }
}

extractData();
