// geocode-lahore.mjs
// Geocodes all Lahore areas using OSM Nominatim — real coordinates only.
// Run: node geocode-lahore.mjs
// Output: lahore-areas-verified.json

import fs from 'fs';
import https from 'https';

// ─── AREA LIST with aliases ────────────────────────────────────────────────────
// aliases[] = alternate search terms users might type
// searchQuery = what to send to Nominatim (override if name alone is ambiguous)
const AREAS = [
  // ── DHA ──
  { name: 'DHA Phase 1', aliases: ['Defence Phase 1', 'DHA 1'], zone: 'DHA', searchQuery: 'DHA Phase 1 Lahore' },
  { name: 'DHA Phase 2', aliases: ['Defence Phase 2', 'DHA 2'], zone: 'DHA', searchQuery: 'DHA Phase 2 Lahore' },
  { name: 'DHA Phase 3', aliases: ['Defence Phase 3', 'DHA 3'], zone: 'DHA', searchQuery: 'DHA Phase 3 Lahore' },
  { name: 'DHA Phase 4', aliases: ['Defence Phase 4', 'DHA 4'], zone: 'DHA', searchQuery: 'DHA Phase 4 Lahore' },
  { name: 'DHA Phase 5', aliases: ['Defence Phase 5', 'DHA 5'], zone: 'DHA', searchQuery: 'DHA Phase 5 Lahore' },
  { name: 'DHA Phase 6', aliases: ['Defence Phase 6', 'DHA 6'], zone: 'DHA', searchQuery: 'DHA Phase 6 Lahore' },
  { name: 'DHA Phase 7', aliases: ['Defence Phase 7', 'DHA 7'], zone: 'DHA', searchQuery: 'DHA Phase 7 Lahore' },
  { name: 'DHA Phase 8', aliases: ['Defence Phase 8', 'DHA 8'], zone: 'DHA', searchQuery: 'DHA Phase 8 Lahore' },
  { name: 'DHA Phase 9 Prism', aliases: ['DHA 9 Prism', 'DHA Phase 9'], zone: 'DHA', searchQuery: 'DHA Phase 9 Prism Lahore' },

  // ── Bahria Town ──
  { name: 'Bahria Town', aliases: ['Bahria'], zone: 'Bahria Town', searchQuery: 'Bahria Town Lahore' },
  { name: 'Bahria Town Phase 1', aliases: ['Bahria Phase 1', 'Bahria 1'], zone: 'Bahria Town', searchQuery: 'Bahria Town Phase 1 Lahore' },
  { name: 'Bahria Town Phase 2', aliases: ['Bahria Phase 2', 'Bahria 2'], zone: 'Bahria Town', searchQuery: 'Bahria Town Phase 2 Lahore' },
  { name: 'Bahria Town Phase 4', aliases: ['Bahria Phase 4', 'Bahria 4'], zone: 'Bahria Town', searchQuery: 'Bahria Town Phase 4 Lahore' },
  { name: 'Bahria Town Phase 6', aliases: ['Bahria Phase 6', 'Bahria 6'], zone: 'Bahria Town', searchQuery: 'Bahria Town Phase 6 Lahore' },
  { name: 'Bahria Town Phase 7', aliases: ['Bahria Phase 7', 'Bahria 7'], zone: 'Bahria Town', searchQuery: 'Bahria Town Phase 7 Lahore' },
  { name: 'Bahria Orchard', aliases: ['Bahria Orchard Phase 1'], zone: 'Bahria Town', searchQuery: 'Bahria Orchard Lahore' },

  // ── Gulberg ──
  { name: 'Gulberg', aliases: ['Gulberg Main'], zone: 'Gulberg', searchQuery: 'Gulberg Lahore' },
  { name: 'Gulberg 1', aliases: ['Gulberg I'], zone: 'Gulberg', searchQuery: 'Gulberg 1 Lahore' },
  { name: 'Gulberg 2', aliases: ['Gulberg II'], zone: 'Gulberg', searchQuery: 'Gulberg 2 Lahore' },
  { name: 'Gulberg 3', aliases: ['Gulberg III', 'MM Alam Road'], zone: 'Gulberg', searchQuery: 'Gulberg 3 Lahore' },
  { name: 'Gulberg 4', aliases: ['Gulberg IV'], zone: 'Gulberg', searchQuery: 'Gulberg 4 Lahore' },
  { name: 'Gulberg 5', aliases: ['Gulberg V'], zone: 'Gulberg', searchQuery: 'Gulberg 5 Lahore' },

  // ── Model Town ──
  { name: 'Model Town', aliases: ['Model Town Extension'], zone: 'Model Town', searchQuery: 'Model Town Lahore' },
  { name: 'Model Town Block A', aliases: ['Model Town A'], zone: 'Model Town', searchQuery: 'Model Town Block A Lahore' },
  { name: 'Model Town Block B', aliases: ['Model Town B'], zone: 'Model Town', searchQuery: 'Model Town Block B Lahore' },
  { name: 'Model Town Block C', aliases: ['Model Town C'], zone: 'Model Town', searchQuery: 'Model Town Block C Lahore' },
  { name: 'Model Town Block D', aliases: ['Model Town D'], zone: 'Model Town', searchQuery: 'Model Town Block D Lahore' },
  { name: 'Model Town Block E', aliases: ['Model Town E'], zone: 'Model Town', searchQuery: 'Model Town Block E Lahore' },
  { name: 'Model Town Block F', aliases: ['Model Town F'], zone: 'Model Town', searchQuery: 'Model Town Block F Lahore' },

  // ── Johar Town ──
  { name: 'Johar Town', aliases: ['Johar'], zone: 'Johar Town', searchQuery: 'Johar Town Lahore' },
  { name: 'Johar Town Block A', aliases: ['Johar A'], zone: 'Johar Town', searchQuery: 'Johar Town Block A Lahore' },
  { name: 'Johar Town Block F', aliases: ['Johar F'], zone: 'Johar Town', searchQuery: 'Johar Town Block F Lahore' },
  { name: 'Johar Town Block H', aliases: ['Johar H'], zone: 'Johar Town', searchQuery: 'Johar Town Block H Lahore' },

  // ── Wapda Town ──
  { name: 'Wapda Town', aliases: [], zone: 'Wapda Town', searchQuery: 'Wapda Town Lahore' },
  { name: 'Wapda Town Phase 1', aliases: ['Wapda 1'], zone: 'Wapda Town', searchQuery: 'Wapda Town Phase 1 Lahore' },
  { name: 'Wapda Town Phase 2', aliases: ['Wapda 2'], zone: 'Wapda Town', searchQuery: 'Wapda Town Phase 2 Lahore' },

  // ── Major localities ──
  { name: 'Garden Town', aliases: ['GT'], zone: 'Garden Town', searchQuery: 'Garden Town Lahore' },
  { name: 'Shadman', aliases: ['Shadman Colony'], zone: 'Shadman', searchQuery: 'Shadman Lahore' },
  { name: 'Samanabad', aliases: [], zone: 'Samanabad', searchQuery: 'Samanabad Lahore' },
  { name: 'Faisal Town', aliases: [], zone: 'Faisal Town', searchQuery: 'Faisal Town Lahore' },
  { name: 'Allama Iqbal Town', aliases: ['Iqbal Town', 'AIT'], zone: 'Iqbal Town', searchQuery: 'Allama Iqbal Town Lahore' },
  { name: 'Township', aliases: [], zone: 'Township', searchQuery: 'Township Lahore' },
  { name: 'Muslim Town', aliases: [], zone: 'Muslim Town', searchQuery: 'Muslim Town Lahore' },
  { name: 'Green Town', aliases: [], zone: 'Green Town', searchQuery: 'Green Town Lahore' },
  { name: 'Ichra', aliases: [], zone: 'Ichra', searchQuery: 'Ichra Lahore' },
  { name: 'Mozang', aliases: ['Mozang Chungi'], zone: 'Mozang', searchQuery: 'Mozang Lahore' },
  { name: 'Gulshan Ravi', aliases: ['Gulshan-e-Ravi'], zone: 'Gulshan Ravi', searchQuery: 'Gulshan Ravi Lahore' },
  { name: 'Shad Bagh', aliases: ['Shadbagh'], zone: 'Shad Bagh', searchQuery: 'Shad Bagh Lahore' },
  { name: 'Garhi Shahu', aliases: [], zone: 'Garhi Shahu', searchQuery: 'Garhi Shahu Lahore' },
  { name: 'Naulakha', aliases: [], zone: 'Naulakha', searchQuery: 'Naulakha Lahore' },
  { name: 'Baghbanpura', aliases: [], zone: 'Baghbanpura', searchQuery: 'Baghbanpura Lahore' },
  { name: 'Mughalpura', aliases: [], zone: 'Mughalpura', searchQuery: 'Mughalpura Lahore' },
  { name: 'Shahdara', aliases: ['Shahdara Town'], zone: 'Shahdara', searchQuery: 'Shahdara Lahore' },
  { name: 'Harbanspura', aliases: [], zone: 'Harbanspura', searchQuery: 'Harbanspura Lahore' },
  { name: 'Tajpura', aliases: [], zone: 'Tajpura', searchQuery: 'Tajpura Lahore' },
  { name: 'Kot Lakhpat', aliases: [], zone: 'Kot Lakhpat', searchQuery: 'Kot Lakhpat Lahore' },
  { name: 'Thokar Niaz Baig', aliases: ['Thokar'], zone: 'Thokar', searchQuery: 'Thokar Niaz Baig Lahore' },
  { name: 'Raiwind', aliases: ['Raiwind Road'], zone: 'Raiwind', searchQuery: 'Raiwind Lahore' },
  { name: 'Kahna', aliases: ['Kahna Nau'], zone: 'Kahna', searchQuery: 'Kahna Lahore' },
  { name: 'Valencia Town', aliases: ['Valencia'], zone: 'Valencia', searchQuery: 'Valencia Town Lahore' },
  { name: 'Lake City', aliases: [], zone: 'Lake City', searchQuery: 'Lake City Lahore' },
  { name: 'Paragon City', aliases: [], zone: 'Paragon City', searchQuery: 'Paragon City Lahore' },
  { name: 'EME Housing Society', aliases: ['EME'], zone: 'EME', searchQuery: 'EME Housing Society Lahore' },
  { name: 'Ferozwala', aliases: [], zone: 'Ferozwala', searchQuery: 'Ferozwala Lahore' },
  { name: 'Muridke', aliases: [], zone: 'Muridke', searchQuery: 'Muridke Lahore' },
  { name: 'Sundar', aliases: ['Sundar Industrial Estate'], zone: 'Sundar', searchQuery: 'Sundar Lahore' },
  { name: 'Manga Mandi', aliases: ['Manga'], zone: 'Manga', searchQuery: 'Manga Mandi Lahore' },
  { name: 'Misri Shah', aliases: [], zone: 'Old Lahore', searchQuery: 'Misri Shah Lahore' },
  { name: 'Qila Gujjar Singh', aliases: [], zone: 'Qila Gujjar Singh', searchQuery: 'Qila Gujjar Singh Lahore' },
  { name: 'Ravi Road', aliases: [], zone: 'Ravi Road', searchQuery: 'Ravi Road Lahore' },
  { name: 'Shalimar', aliases: ['Shalimar Colony'], zone: 'Shalimar', searchQuery: 'Shalimar Lahore' },
  { name: 'Hanjarwal', aliases: [], zone: 'Hanjarwal', searchQuery: 'Hanjarwal Lahore' },
  { name: 'Walton', aliases: ['Walton Road'], zone: 'Cantt', searchQuery: 'Walton Lahore' },
  { name: 'Lahore Cantt', aliases: ['Cantonment', 'Cantt'], zone: 'Cantt', searchQuery: 'Lahore Cantonment' },

  // ── Old City ──
  { name: 'Walled City', aliases: ['Old City', 'Androon Lahore'], zone: 'Old Lahore', searchQuery: 'Walled City of Lahore' },
  { name: 'Anarkali', aliases: ['Anarkali Bazaar'], zone: 'Old Lahore', searchQuery: 'Anarkali Lahore' },
  { name: 'Data Darbar', aliases: ['Data Gunj Bakhsh', 'Data Sahib'], zone: 'Old Lahore', searchQuery: 'Data Darbar Lahore' },

  // ── Landmarks used as area references ──
  { name: 'Liberty Market', aliases: ['Liberty'], zone: 'Gulberg', searchQuery: 'Liberty Market Lahore' },
  { name: 'Fortress Stadium', aliases: ['Fortress'], zone: 'Cantt', searchQuery: 'Fortress Stadium Lahore' },
  { name: 'Packages Mall', aliases: ['Packages'], zone: 'Township', searchQuery: 'Packages Mall Lahore' },
  { name: 'Emporium Mall Area', aliases: ['Emporium'], zone: 'Johar Town', searchQuery: 'Emporium Mall Lahore' },
  { name: 'Expo Centre', aliases: [], zone: 'Johar Town', searchQuery: 'Expo Centre Lahore' },
  { name: 'Canal Road', aliases: ['Main Canal'], zone: 'Canal Road', searchQuery: 'Canal Road Lahore' },
  { name: 'Ferozepur Road', aliases: [], zone: 'Ferozepur Road', searchQuery: 'Ferozepur Road Lahore' },
  { name: 'GT Road', aliases: ['Grand Trunk Road'], zone: 'GT Road', searchQuery: 'GT Road Lahore' },
];

// ─── Nominatim geocoder ────────────────────────────────────────────────────────
function geocode(query) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=3&countrycodes=pk&accept-language=en`;
    const options = {
      headers: { 'User-Agent': 'StuFlux-Area-Geocoder/1.0 (stuflux-project)' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          // Prefer results that mention Lahore in display_name
          const lahoreResult = results.find(r => r.display_name?.toLowerCase().includes('lahore'))
            || results[0];
          if (lahoreResult) {
            resolve({ lat: parseFloat(lahoreResult.lat), lon: parseFloat(lahoreResult.lon), found: true });
          } else {
            resolve({ lat: null, lon: null, found: false });
          }
        } catch {
          resolve({ lat: null, lon: null, found: false });
        }
      });
    }).on('error', () => resolve({ lat: null, lon: null, found: false }));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const verified = [];
  const failed = [];

  console.log(`\nGeocoding ${AREAS.length} areas via Nominatim...\n`);

  for (let i = 0; i < AREAS.length; i++) {
    const area = AREAS[i];
    process.stdout.write(`[${String(i+1).padStart(3)}/${AREAS.length}] ${area.name.padEnd(35)}`);

    const result = await geocode(area.searchQuery || area.name + ' Lahore');

    if (result.found) {
      console.log(`✓  ${result.lat.toFixed(4)}, ${result.lon.toFixed(4)}`);
      verified.push({
        id: i,
        name: area.name,
        aliases: area.aliases,
        lat: parseFloat(result.lat.toFixed(5)),
        lon: parseFloat(result.lon.toFixed(5)),
        zone: area.zone,
      });
    } else {
      console.log(`✗  NOT FOUND`);
      failed.push(area.name);
    }

    // Nominatim rate limit: 1 req/sec
    await sleep(1100);
  }

  // ─── Write output ──────────────────────────────────────────────────────────
  fs.writeFileSync('lahore-areas-verified.json', JSON.stringify(verified, null, 2));

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Verified: ${verified.length} areas  →  lahore-areas-verified.json`);

  if (failed.length > 0) {
    console.log(`\n⚠️  Not found (${failed.length}) — add coordinates manually:`);
    failed.forEach(n => console.log(`   - ${n}`));
    fs.writeFileSync('lahore-geocode-failed.txt', failed.join('\n'));
    console.log(`   (saved to lahore-geocode-failed.txt)`);
  }

  console.log(`\nSample output:`);
  console.log(JSON.stringify(verified.slice(0, 2), null, 2));
}

main();
