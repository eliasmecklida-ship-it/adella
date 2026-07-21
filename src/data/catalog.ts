import { MediaItem, SubtitleRequest } from '../types';

export const initialMediaItems: MediaItem[] = [
  {
    id: 'lion-king-2019',
    title: 'The Lion King',
    originalTitle: 'Mfalme Simba',
    type: 'movie',
    year: 2019,
    genre: ['Adventure', 'Drama', 'Family'],
    description: 'After the murder of his father, a young lion prince flees his kingdom only to learn the true meaning of responsibility and bravery.',
    descriptionSw: 'Baada ya mauaji ya baba yake, mwanamfalme mdogo wa simba anakimbia ufalme wake na kuja kujifunza maana halisi ya wajibu na ushujaa.',
    posterUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    rating: 8.5,
    subtitles: [
      {
        id: 'lk-sw-1',
        language: 'Kiswahili',
        languageCode: 'sw',
        translator: 'Simba_Subz_TZ',
        rating: 4.8,
        downloads: 1420,
        fileSize: '32 KB',
        version: '720p.1080p.WEBRip.x264',
        createdAt: '2026-05-12',
        srtContent: `1
00:00:30,400 --> 00:00:34,800
[Muziki wa ufunguzi ukiwa na sauti kubwa ya Kiafrika]

2
00:00:45,100 --> 00:00:48,500
Njoomoni, sote tunakaribishwa kwenye Ardhi ya Fahari!

3
00:00:49,000 --> 00:00:53,200
Leo ni siku kuu ya kumtambulisha mwanamfalme mpya, Simba!`
      },
      {
        id: 'lk-sw-2',
        language: 'Kiswahili',
        languageCode: 'sw',
        translator: 'Tafsiri_AI_Fast',
        rating: 4.2,
        downloads: 512,
        fileSize: '34 KB',
        version: '1080p.BluRay.x265',
        createdAt: '2026-06-01',
        srtContent: `1
00:00:30,400 --> 00:00:34,800
[Sauti ya kishindo cha Simba kikubwa kuanza]

2
00:00:45,100 --> 00:00:48,500
Mfalme amezaliwa leo kwenye Nyika yetu!`
      }
    ]
  },
  {
    id: 'black-panther-2018',
    title: 'Black Panther',
    originalTitle: 'Chui Mweusi',
    type: 'movie',
    year: 2018,
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    description: "T'Challa, heir to the hidden and advanced kingdom of Wakanda, must step forward to lead his people into a new future and confront a challenger.",
    descriptionSw: "T'Challa, mrithi wa ufalme wa Wakanda uliofichika na kuendelea kiteknolojia, lazima ajitokeze kuongoza watu wake katika maisha mpya na kupambana na mpinzani wake.",
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400',
    rating: 8.9,
    subtitles: [
      {
        id: 'bp-sw-1',
        language: 'Kiswahili',
        languageCode: 'sw',
        translator: 'Wakanda_Tanzania_Crew',
        rating: 4.9,
        downloads: 2310,
        fileSize: '38 KB',
        version: '720p.1080p.BluRay',
        createdAt: '2026-03-10',
        srtContent: `1
00:01:05,200 --> 00:01:10,500
Zamani sana, kimondo kilichojaa Vibranium kiliangukia bara la Afrika.`
      }
    ]
  },
  {
    id: 'money-heist-s1',
    title: 'Money Heist (La Casa de Papel)',
    originalTitle: 'Wizi wa Pesa',
    type: 'series',
    year: 2017,
    genre: ['Action', 'Crime', 'Drama'],
    description: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.',
    descriptionSw: 'Kundi lisilo la kawaida la wezi linajaribu kufanya wizi mkubwa na kamili zaidi katika historia ya Uhispania - kuiba euro bilioni 2.4 kutoka Royal Mint ya Uhispania.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400',
    rating: 8.7,
    subtitles: [
      {
        id: 'mh-sw-s1-e1',
        language: 'Kiswahili',
        languageCode: 'sw',
        translator: 'Profesa_Mkuu',
        rating: 4.8,
        downloads: 1845,
        fileSize: '45 KB',
        version: 'S01E01.720p.NF.WEBRip',
        createdAt: '2026-01-15',
        season: 1,
        episode: 1,
        episodeTitle: 'E01: Mwanzo wa Mipango (Efectuar el atraco)',
        srtContent: `1
00:00:12,100 --> 00:00:15,600
Tokyo: Jina langu ni Tokyo. Na hivi ndivyo nilivyokutana na Profesa.

2
00:00:16,200 --> 00:00:20,400
Alikuwa mtu wa kipekee sana, hakuwa na rekodi zozote za uhalifu.`
      },
      {
        id: 'mh-sw-s1-e2',
        language: 'Kiswahili',
        languageCode: 'sw',
        translator: 'Profesa_Mkuu',
        rating: 4.7,
        downloads: 1250,
        fileSize: '42 KB',
        version: 'S01E02.720p.NF.WEBRip',
        createdAt: '2026-01-16',
        season: 1,
        episode: 2,
        episodeTitle: 'E02: Kuingia Royal Mint (Imprudencias)',
        srtContent: `1
00:00:45,100 --> 00:00:48,200
Denver: Sasa tuko ndani! Kila mtu asogee chini haraka!

2
00:00:49,300 --> 00:00:52,900
Berlin: Tulia kabisa, hakuna atakayepata madhara mradi mnasikiliza.`
      },
      {
        id: 'mh-sw-s2-e1',
        language: 'Kiswahili',
        languageCode: 'sw',
        translator: 'Profesa_Mkuu',
        rating: 4.9,
        downloads: 980,
        fileSize: '40 KB',
        version: 'S02E01.720p.NF.WEBRip',
        createdAt: '2026-02-10',
        season: 2,
        episode: 1,
        episodeTitle: 'E01: Presha Inapanda (Máscaras)',
        srtContent: `1
00:00:30,200 --> 00:00:35,400
Profesa: Mambo yanazidi kuwa magumu huku nje, lazima tuongeze kasi!`
      }
    ]
  },
  {
    id: 'wednesday-s1',
    title: 'Wednesday',
    originalTitle: 'Jumatano',
    type: 'series',
    year: 2022,
    genre: ['Comedy', 'Fantasy', 'Mystery'],
    description: "While attending Nevermore Academy, Wednesday Addams attempts to master her emerging psychic ability, thwart a killing spree, and solve the mystery that embroiled her parents 25 years ago.",
    descriptionSw: "Akiwa anasoma katika Chuo cha Nevermore, Wednesday Addams anajaribu kudhibiti uwezo wake wa kiakili unaochipuka, kuzuia mauaji mfululizo, na kutatua fumbo lililowahusu wazazi wake miaka 25 iliyopita.",
    posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=400',
    rating: 8.2,
    subtitles: [
      {
        id: 'wd-sw-s1-e1',
        language: 'Kiswahili',
        languageCode: 'sw',
        translator: 'Wednesday_Bongo_Fans',
        rating: 4.5,
        downloads: 1105,
        fileSize: '41 KB',
        version: 'S01E01.720p.NF.WEBRip',
        createdAt: '2026-02-18',
        season: 1,
        episode: 1,
        episodeTitle: 'E01: Mtoto wa Alhamisi (Wednesday\'s Child is Full of Woe)',
        srtContent: `1
00:00:15,000 --> 00:00:19,200
Wednesday: Sijali kama watu hawanipendi. Hilo linanipa nguvu.`
      },
      {
        id: 'wd-sw-s1-e2',
        language: 'Kiswahili',
        languageCode: 'sw',
        translator: 'Wednesday_Bongo_Fans',
        rating: 4.6,
        downloads: 890,
        fileSize: '39 KB',
        version: 'S01E02.720p.NF.WEBRip',
        createdAt: '2026-02-19',
        season: 1,
        episode: 2,
        episodeTitle: 'E02: Upweke wa Kutisha (Woe is the Loneliest Number)',
        srtContent: `1
00:00:20,500 --> 00:00:24,100
Wednesday: Shule hii ina siri nyingi kuliko nilivyotegemea.`
      }
    ]
  }
];

export const initialRequests: SubtitleRequest[] = [
  {
    id: 'req-1',
    title: 'Dune: Part Two',
    type: 'movie',
    year: 2024,
    requestedBy: 'Ali_Kiba99',
    requestDate: '2026-07-15',
    status: 'pending',
    votes: 42
  },
  {
    id: 'req-2',
    title: 'Oppenheimer',
    type: 'movie',
    year: 2023,
    requestedBy: 'BongoCinema',
    requestDate: '2026-07-16',
    status: 'pending',
    votes: 28
  },
  {
    id: 'req-3',
    title: 'Stranger Things - Season 5',
    type: 'series',
    requestedBy: 'SubzLover',
    requestDate: '2026-07-18',
    status: 'pending',
    votes: 19
  },
  {
    id: 'req-4',
    title: 'Interstellar',
    type: 'movie',
    year: 2014,
    requestedBy: 'AstronomyTZ',
    requestDate: '2026-07-12',
    status: 'completed',
    votes: 56
  }
];
