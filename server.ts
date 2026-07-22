import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { initialMediaItems, initialRequests } from './src/data/catalog.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));

// Persistent File Storage (data_store.json)
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

function loadStoredData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      return parsed;
    }
  } catch (err) {
    console.error('Hitilafu ya kusoma data_store.json:', err);
  }
  return null;
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ mediaItems, requests }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Hitilafu ya kuhifadhi data_store.json:', err);
  }
}

const initialLoaded = loadStoredData();

let mediaItems = initialLoaded && Array.isArray(initialLoaded.mediaItems) && initialLoaded.mediaItems.length > 0
  ? initialLoaded.mediaItems
  : [...initialMediaItems].map((item, index) => ({
      ...item,
      createdAt: item.createdAt || new Date(Date.now() - (initialMediaItems.length - index) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: item.updatedAt || new Date(Date.now() - (initialMediaItems.length - index) * 24 * 60 * 60 * 1000).toISOString(),
    }));

let requests = initialLoaded && Array.isArray(initialLoaded.requests) && initialLoaded.requests.length > 0
  ? initialLoaded.requests
  : [...initialRequests];

// Initialize Firebase Firestore Database
let db: ReturnType<typeof getFirestore> | null = null;
try {
  const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || undefined);
    console.log('Firebase Firestore imewezeshwa vyema!');
  }
} catch (err) {
  console.error('Hitilafu ya kuanzisha Firebase Firestore:', err);
}

// Landanisha data za mwanzo kutoka/kwenda Firebase Firestore
async function initFirestoreData() {
  if (!db) return;
  try {
    const mediaSnap = await getDocs(collection(db, 'mediaItems'));
    if (!mediaSnap.empty) {
      const fetchedMedia: any[] = [];
      mediaSnap.forEach((docSnap) => {
        fetchedMedia.push(docSnap.data());
      });
      if (fetchedMedia.length > 0) {
        mediaItems = fetchedMedia;
        saveData();
        console.log(`Zimepakiwa filamu ${fetchedMedia.length} kutoka Firebase Firestore.`);
      }
    } else {
      console.log('Firebase Firestore haina filamu, inaweka data za mwanzo...');
      for (const item of mediaItems) {
        await setDoc(doc(db, 'mediaItems', item.id), item);
      }
    }

    const reqSnap = await getDocs(collection(db, 'requests'));
    if (!reqSnap.empty) {
      const fetchedReqs: any[] = [];
      reqSnap.forEach((docSnap) => {
        fetchedReqs.push(docSnap.data());
      });
      if (fetchedReqs.length > 0) {
        requests = fetchedReqs;
        saveData();
        console.log(`Zimepakiwa maombi ${fetchedReqs.length} kutoka Firebase Firestore.`);
      }
    } else {
      console.log('Firebase Firestore haina maombi, inaweka data za mwanzo...');
      for (const reqItem of requests) {
        await setDoc(doc(db, 'requests', reqItem.id), reqItem);
      }
    }
  } catch (err) {
    console.error('Hitilafu wakati wa kulandanisha na Firebase Firestore:', err);
  }
}

initFirestoreData();

async function saveMediaToFirestore(item: any) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'mediaItems', item.id), item);
  } catch (err) {
    console.error(`Hitilafu ya kuhifadhi media ${item.id} Firebase:`, err);
  }
}

async function deleteMediaFromFirestore(itemId: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'mediaItems', itemId));
  } catch (err) {
    console.error(`Hitilafu ya kufuta media ${itemId} Firebase:`, err);
  }
}

async function saveRequestToFirestore(reqItem: any) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'requests', reqItem.id), reqItem);
  } catch (err) {
    console.error(`Hitilafu ya kuhifadhi ombi ${reqItem.id} Firebase:`, err);
  }
}

async function deleteRequestFromFirestore(reqId: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'requests', reqId));
  } catch (err) {
    console.error(`Hitilafu ya kufuta ombi ${reqId} Firebase:`, err);
  }
}

// Shared Gemini API Client (Lazy initialized)
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn('GEMINI_API_KEY haijawekwa kwenye mazingira. Njia ya majaribio (simulated mode) itatumika.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ==================== API ROUTES ====================

// 1. Pata orodha ya filamu na series zote
app.get('/api/media', (req, res) => {
  const sortedMedia = [...mediaItems].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || '2026-01-01').getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || '2026-01-01').getTime();
    return dateB - dateA;
  });
  res.json(sortedMedia);
});

// 2. Pata filamu maalum kwa kutumia ID
app.get('/api/media/:id', (req, res) => {
  const item = mediaItems.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Filamu haikupatikana.' });
  }
  res.json(item);
});

// 3. Omba subtitle mpya
app.post('/api/subtitles/request', (req, res) => {
  const { title, type, year, requestedBy } = req.body;
  if (!title || !type) {
    return res.status(400).json({ error: 'Tafadhali jaza jina la filamu na aina yake.' });
  }

  const newRequest = {
    id: `req-${Date.now()}`,
    title,
    type: type as 'movie' | 'series',
    year: year ? parseInt(year) : undefined,
    requestedBy: requestedBy || 'Mtumiaji Asiyejulikana',
    requestDate: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
    votes: 1
  };

  requests.push(newRequest);
  saveData();
  saveRequestToFirestore(newRequest);
  res.status(201).json(newRequest);
});

// 4. Pata orodha ya maombi yote ya subtitles
app.get('/api/requests', (req, res) => {
  res.json(requests);
});

// 5. Piga kura (Vote) kuongeza kipaumbele cha ombi la subtitle
app.post('/api/requests/:id/vote', (req, res) => {
  const request = requests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Ombi hili halikupatikana.' });
  }
  request.votes += 1;
  saveData();
  saveRequestToFirestore(request);
  res.json(request);
});

// Helper ya kuhakiki kama ni Developer
function isDeveloper(key: string): boolean {
  if (!key) return false;
  const validKeys = [
    'milembe',
    'AQ.Ab8RN6LvS0_I4R544ENZNYukTrVXRBhZoTWExUFSUIRP3GX35g',
    'eliasjosiah13',
    'eliasjosiah13@gmail.com'
  ];
  return validKeys.includes(key.trim());
}

// Verification Endpoint kwa ajili ya Admin login
app.post('/api/admin/verify', (req, res) => {
  const { developerKey } = req.body;
  if (isDeveloper(developerKey)) {
    return res.json({ success: true, message: 'Umekubaliwa kama Msanidi Programu!' });
  }
  res.status(401).json({ error: 'Nenosiri si sahihi.' });
});

// Admin Route: Ongeza Filamu au Series mpya
app.post('/api/media', (req, res) => {
  const { title, originalTitle, type, year, genre, description, descriptionSw, posterUrl, rating, developerKey } = req.body;
  
  if (!isDeveloper(developerKey)) {
    return res.status(401).json({ error: 'Huruhusiwi kufanya hivi! Sehemu hii ni ya msanidi pekee.' });
  }

  if (!title || !type || !year || !description) {
    return res.status(400).json({ error: 'Tafadhali jaza taarifa zote za msingi (title, type, year, description).' });
  }

  const newItem = {
    id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${year}`,
    title,
    originalTitle: originalTitle || title,
    type: type as 'movie' | 'series',
    year: parseInt(year),
    genre: Array.isArray(genre) ? genre : genre.split(',').map((g: string) => g.trim()),
    description,
    descriptionSw: descriptionSw || description,
    posterUrl: posterUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    rating: parseFloat(rating) || 8.0,
    subtitles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mediaItems.push(newItem);
  saveData();
  saveMediaToFirestore(newItem);
  res.status(201).json(newItem);
});

// Admin Route: Futa Movie au Series iliyopo
app.delete('/api/media/:id', (req, res) => {
  const { developerKey } = req.query;
  if (!isDeveloper(developerKey as string)) {
    return res.status(401).json({ error: 'Huruhusiwi! Sehemu hii ni ya msanidi tu.' });
  }

  const mediaIndex = mediaItems.findIndex(m => m.id === req.params.id);
  if (mediaIndex === -1) {
    return res.status(404).json({ error: 'Filamu au Series haikupatikana.' });
  }

  const deletedItem = mediaItems.splice(mediaIndex, 1)[0];
  saveData();
  deleteMediaFromFirestore(req.params.id);
  res.json({ success: true, message: `Filamu/Series "${deletedItem.title}" imefutwa vyema.` });
});

// Admin Route: Futa ombi la subtitle
app.delete('/api/requests/:id', (req, res) => {
  const { developerKey } = req.query;
  if (!isDeveloper(developerKey as string)) {
    return res.status(401).json({ error: 'Huruhusiwi! Sehemu hii ni ya msanidi tu.' });
  }

  const reqIndex = requests.findIndex(r => r.id === req.params.id);
  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Ombi halikupatikana.' });
  }

  requests.splice(reqIndex, 1);
  saveData();
  deleteRequestFromFirestore(req.params.id);
  res.json({ success: true, message: 'Ombi limefutwa vyema.' });
});

// Admin Route: Weka ombi kuwa limekamilika
app.post('/api/requests/:id/complete', (req, res) => {
  const { developerKey } = req.body;
  if (!isDeveloper(developerKey)) {
    return res.status(401).json({ error: 'Huruhusiwi! Sehemu hii ni ya msanidi tu.' });
  }

  const request = requests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Ombi halikupatikana.' });
  }

  request.status = 'completed';
  saveData();
  saveRequestToFirestore(request);
  res.json(request);
});

// 6. Changia subtitle yako ya Kiswahili (Msanidi tu ndiye anayeruhusiwa kupakia hapa)
app.post('/api/subtitles/upload', (req, res) => {
  const { mediaId, translator, srtContent, version, season, episode, episodeTitle, developerKey } = req.body;
  
  if (!isDeveloper(developerKey)) {
    return res.status(401).json({ error: 'Huruhusiwi kupakia subtitle hapa! Njia hii ni ya Msanidi tu. Unaweza kutumia kichupo cha "Tafsiri kwa AI" kutafsiri na kupakua.' });
  }

  if (!mediaId || !translator || !srtContent) {
    return res.status(400).json({ error: 'Tafadhali jaza taarifa zote zinazohitajika (mediaId, translator, srtContent).' });
  }

  const mediaIndex = mediaItems.findIndex(m => m.id === mediaId);
  if (mediaIndex === -1) {
    return res.status(404).json({ error: 'Filamu iliyochaguliwa haimo kwenye mfumo wetu.' });
  }

  const newSubtitle = {
    id: `sub-${Date.now()}`,
    language: 'Kiswahili',
    languageCode: 'sw',
    translator,
    rating: 5.0, // Alama kamili ya kwanza
    downloads: 0,
    fileSize: `${Math.round(srtContent.length / 1024)} KB`,
    version: version || 'All WEB/BluRay',
    createdAt: new Date().toISOString().split('T')[0],
    srtContent,
    season: season ? parseInt(season) : undefined,
    episode: episode ? parseInt(episode) : undefined,
    episodeTitle: episodeTitle || undefined
  };

  mediaItems[mediaIndex].subtitles.push(newSubtitle);
  mediaItems[mediaIndex].updatedAt = new Date().toISOString();

  // Kama kulikuwa na ombi linalosubiri jina hili, liweke kama limekamilika
  const matchingReq = requests.find(r => r.title.toLowerCase() === mediaItems[mediaIndex].title.toLowerCase());
  if (matchingReq) {
    matchingReq.status = 'completed';
    saveRequestToFirestore(matchingReq);
  }

  saveData();
  saveMediaToFirestore(mediaItems[mediaIndex]);
  res.status(201).json(newSubtitle);
});

// 7. Ongeza idadi ya downloads kwa subtitle fulani
app.post('/api/subtitles/:id/download', (req, res) => {
  let found = false;
  let targetMedia = null;
  for (const item of mediaItems) {
    const sub = item.subtitles.find(s => s.id === req.params.id);
    if (sub) {
      sub.downloads += 1;
      found = true;
      targetMedia = item;
      break;
    }
  }
  if (found && targetMedia) {
    saveData();
    saveMediaToFirestore(targetMedia);
  }
  res.json({ success: found });
});

// Helper interfaces kwa ajili ya kutafsiri SRT
interface SrtBlock {
  index: string;
  timeline: string;
  text: string;
}

function parseSrt(srtText: string): SrtBlock[] {
  const normalized = srtText.replace(/\r\n/g, '\n');
  const blocksRaw = normalized.split(/\n\s*\n/);
  const blocks: SrtBlock[] = [];

  for (const block of blocksRaw) {
    const lines = block.trim().split('\n');
    if (lines.length >= 2) {
      const index = lines[0].trim();
      const timeline = lines[1].trim();
      if (timeline.includes('-->')) {
        const text = lines.slice(2).join('\n').trim();
        blocks.push({ index, timeline, text });
      }
    }
  }
  return blocks;
}

function reconstructSrt(blocks: SrtBlock[]): string {
  return blocks
    .map(b => `${b.index}\n${b.timeline}\n${b.text}`)
    .join('\n\n');
}

// 8. API ya kutafsiri faili la SRT kwenda Kiswahili kwa uwezo wa Gemini AI
app.post('/api/translate', async (req, res) => {
  const { srtContent, instructions } = req.body;

  if (!srtContent) {
    return res.status(400).json({ error: 'Hakuna maudhui ya subtitle yaliyopokewa.' });
  }

  try {
    const blocks = parseSrt(srtContent);
    if (blocks.length === 0) {
      return res.status(400).json({ error: 'Maudhui ya subtitle hayapo kwenye muundo sahihi wa SRT.' });
    }

    // Kuchagua mkalimani wa Gemini
    const ai = getGeminiClient();

    // Kama Gemini API Key haimo, tutafanya translation ya kujifanya (simulated mode) ili kuokoa maisha ya programu
    if (!ai) {
      console.log('Inatafsiri kwa njia ya simulated (hakuna API Key)...');
      // Simulated translation: translate some common keywords and add Swahili expressions
      const swahiliPhrases = [
        "Mambo vipi mwanangu!",
        "Tazama kile pale!",
        "Mungu wangu, siwezi kuamini hili.",
        "Kimbia haraka kabla hawajafika!",
        "Subiri kidogo tafadhali.",
        "Unamaanisha nini hasa?",
        "Hii ni hatari sana.",
        "Sote tutakufa kama hatutaondoka sasa hivi!",
        "Nenda upande mwingine mimi nitapita huku.",
        "Asante sana rafiki yangu."
      ];

      const translatedBlocks = blocks.map((block, idx) => {
        let swText = block.text;
        // Simple mock substitutions to make it look Swahili
        if (block.text.toLowerCase().includes('hello') || block.text.toLowerCase().includes('hi')) {
          swText = "Habari! " + block.text;
        } else if (block.text.toLowerCase().includes('yes')) {
          swText = "Ndiyo, " + block.text;
        } else if (block.text.toLowerCase().includes('no')) {
          swText = "Hapana! " + block.text;
        } else if (block.text.toLowerCase().includes('look')) {
          swText = "Tazama! " + block.text;
        } else {
          // Fallback selection of funny Swahili movie phrase
          const randomPhrase = swahiliPhrases[idx % swahiliPhrases.length];
          swText = `${randomPhrase} (${block.text})`;
        }
        return {
          ...block,
          text: swText
        };
      });

      const translatedSrt = reconstructSrt(translatedBlocks);
      return res.json({
        translatedSrt,
        simulated: true,
        message: 'Kikumbusho: Umefanikisha tafsiri kwa kutumia "Simulated Mode" kwa sababu GEMINI_API_KEY haijawekwa kwenye Secrets panel ya AI Studio UI. Lakini muundo upo kamili na unaweza kuupakua kama faili halisi la .srt!'
      });
    }

    // Kama Gemini ipo, tutatafsiri kwa makundi (batching) ili kuepuka token limits na kukuza ubora
    const batchSize = 20; // 20 blocks kwa mkupuo
    const totalBlocks = blocks.length;
    const translatedBlocks: SrtBlock[] = [];
    let translationErrors: string[] = [];
    let successfulBatches = 0;

    console.log(`Inaanza kutafsiri subtitle yenye block ${totalBlocks} kwa kutumia Gemini AI...`);

    // Orodha ya models za Gemini halali kwa kutafsiri
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.1-pro-preview'];

    for (let i = 0; i < totalBlocks; i += batchSize) {
      const chunk = blocks.slice(i, i + batchSize);
      const itemsToTranslate = chunk
        .filter(b => b.text.trim().length > 0)
        .map(b => ({ id: String(b.index), text: b.text }));

      if (itemsToTranslate.length === 0) {
        chunk.forEach(b => translatedBlocks.push(b));
        continue;
      }

      const prompt = `Wewe ni mtafsiri stadi wa subtitles za filamu nchini Tanzania na Afrika Mashariki. Tafsiri maandishi yote ya Kiingereza yafuatayo kwenda Kiswahili cha mazungumzo ya filamu (Bongo movie) kinachoeleweka vyema na kubeba hisia halisi.

Maagizo ya ziada kutoka kwa mtumiaji: "${instructions || 'Hakuna maagizo ya ziada.'}"

Kanuni za kufuata kwa umakini:
1. Kila kipengele cha "id" lazima kibaki vilevile kwenye jibu la JSON.
2. Tafsiri kila maandishi ya "text" kwenda "translatedText" kwa Kiswahili. Usirudie maneno ya Kiingereza mfano "My name is" tafsiri "Jina langu ni".
3. Kama kuna tag za HTML kama <i> au <b>, hifadhi tag hizo au tafsiri maneno yaliyomo ndani yake (mfano: <i>My name is David</i> inakuwa <i>Jina langu ni David</i>).
4. Usiruke wala usibadilishe idadi ya vipengele vya JSON.

Hii hapa orodha ya kutafsiri:
${JSON.stringify(itemsToTranslate)}`;

      let batchSuccess = false;
      let lastBatchError = '';

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: "Wewe ni mkalimani wa kitaalamu wa subtitles za filamu. Unapokea JSON array ya vitu vyenye { id, text } na unarudisha JSON array ya vitu vyenye { id, translatedText } ambapo kila maandishi yatafsiriwa kwa Kiswahili.",
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    translatedText: { type: Type.STRING }
                  },
                  required: ['id', 'translatedText']
                }
              }
            }
          });

          let responseText = response.text || '';
          if (!responseText) {
            throw new Error(`Model ${modelName} returned empty text response.`);
          }

          // Safisha Markdown fences kama zipo
          let cleanJson = responseText.trim();
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          }

          const translatedArray: any[] = JSON.parse(cleanJson);
          const resultMap = new Map<string, string>();

          if (Array.isArray(translatedArray)) {
            translatedArray.forEach(item => {
              if (item && item.id !== undefined && item.translatedText) {
                resultMap.set(String(item.id), item.translatedText);
              }
            });
          }

          chunk.forEach(b => {
            const newText = resultMap.get(String(b.index));
            translatedBlocks.push({
              ...b,
              text: newText || b.text
            });
          });

          batchSuccess = true;
          successfulBatches++;
          break; // Batch response retrieved successfully!
        } catch (err: any) {
          lastBatchError = err?.message || String(err);
          console.warn(`Jaribio la model ${modelName} limeshindwa kwenye batch ${i}: ${lastBatchError}`);
        }
      }

      if (!batchSuccess) {
        console.error(`Batch ${i} imefeli kabisa kwa models zote. Error: ${lastBatchError}`);
        translationErrors.push(`Batch ${i}: ${lastBatchError}`);
        chunk.forEach(b => translatedBlocks.push(b));
      }
    }

    if (successfulBatches === 0 && translationErrors.length > 0) {
      return res.status(500).json({
        error: `Tafsiri imeshindwa: ${translationErrors[0]}. Tafadhali hakikisha GEMINI_API_KEY iliyowekwa kwenye Render ni sahihi na haijatishwa (inaanza na AIzaSy...).`
      });
    }

    const translatedSrt = reconstructSrt(translatedBlocks);
    res.json({
      translatedSrt,
      simulated: false,
      message: 'Subtitles zimetafsiriwa kwa ufanisi mkubwa kwa uwezo wa Gemini AI!'
    });

  } catch (err: any) {
    console.error('Hitilafu ya jumla ya kutafsiri:', err);
    res.status(500).json({ error: 'Kuna hitilafu iliyotokea wakati wa kutafsiri subtitle yako. Tafadhali jaribu tena.' });
  }
});


// ==================== VITE MIDDLEWARE & STATIC SERVING ====================

// Mipangilio ya Vite au uwasilishaji wa faili tuli (static files)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ya Subtitles za Kiswahili inaendeshwa kwenye bandari (port) ${PORT}`);
  });
}

startServer();
