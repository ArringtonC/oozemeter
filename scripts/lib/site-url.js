/* THE one base URL for every absolute link the site emits
   (sitemap, robots, OG tags, canonicals, feed, JSON-LD).
   Domain cutover = change this value, then:
     node scripts/set-base-url.js <old-base>   (rewrites static surfaces)
     node scripts/static-pages.js && node scripts/market-pages.js && node scripts/rss.js && node scripts/stamp.js
*/
module.exports = 'https://arringtonc.github.io/oozemeter';
