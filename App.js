import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, ActivityIndicator, Modal, TextInput, Platform, Alert, Share
} from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CHANNEL_ID = 'mea-lux-daily-gold-v3';
const KEYS = {
  USER: '@ml_user',
  SCHED: '@ml_sched',
  STREAK: '@ml_streak',
  MARKS: '@ml_marks',
  NOTES: '@ml_notes',
  CACHE: '@ml_cache',
  DAILY: '@ml_daily',
};

const VERSES = [
  { text: 'Trust in the LORD with all your heart, and lean not on your own understanding.', reference: 'Proverbs 3:5', bookId: 'PRO', bookName: 'Proverbs', chapter: 3, verse: 5 },
  { text: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted over the earth.', reference: 'Psalm 46:10', bookId: 'PSA', bookName: 'Psalms', chapter: 46, verse: 10 },
  { text: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, to give you a future and a hope.', reference: 'Jeremiah 29:11', bookId: 'JER', bookName: 'Jeremiah', chapter: 29, verse: 11 },
  { text: 'Do not fear, for I am with you; do not be afraid, for I am your God. I will strengthen you; I will surely help you.', reference: 'Isaiah 41:10', bookId: 'ISA', bookName: 'Isaiah', chapter: 41, verse: 10 },
  { text: 'The LORD is my shepherd; I shall not want. He makes me lie down in green pastures; He leads me beside quiet waters.', reference: 'Psalm 23:1-2', bookId: 'PSA', bookName: 'Psalms', chapter: 23, verse: 1 },
  { text: 'Come to Me, all you who are weary and burdened, and I will give you rest.', reference: 'Matthew 11:28', bookId: 'MAT', bookName: 'Matthew', chapter: 11, verse: 28 },
  { text: 'And we know that God works all things together for the good of those who love Him, who are called according to His purpose.', reference: 'Romans 8:28', bookId: 'ROM', bookName: 'Romans', chapter: 8, verse: 28 },
  { text: 'Peace I leave with you; My peace I give to you. I do not give to you as the world gives. Do not let your hearts be troubled; do not be afraid.', reference: 'John 14:27', bookId: 'JHN', bookName: 'John', chapter: 14, verse: 27 },
  { text: 'I can do all things through Christ who gives me strength.', reference: 'Philippians 4:13', bookId: 'PHP', bookName: 'Philippians', chapter: 4, verse: 13 },
  { text: 'Your word is a lamp to my feet and a light to my path.', reference: 'Psalm 119:105', bookId: 'PSA', bookName: 'Psalms', chapter: 119, verse: 105 },
  { text: 'Cast all your anxiety on Him, because He cares for you.', reference: '1 Peter 5:7', bookId: '1PE', bookName: '1 Peter', chapter: 5, verse: 7 },
  { text: 'Those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary.', reference: 'Isaiah 40:31', bookId: 'ISA', bookName: 'Isaiah', chapter: 40, verse: 31 },
  { text: 'For God so loved the world that He gave His one and only Son, that everyone who believes in Him shall not perish but have eternal life.', reference: 'John 3:16', bookId: 'JHN', bookName: 'John', chapter: 3, verse: 16 },
  { text: 'God is our refuge and strength, an ever-present help in times of trouble.', reference: 'Psalm 46:1', bookId: 'PSA', bookName: 'Psalms', chapter: 46, verse: 1 },
  { text: 'Seek first the kingdom of God and His righteousness, and all these things will be added unto you.', reference: 'Matthew 6:33', bookId: 'MAT', bookName: 'Matthew', chapter: 6, verse: 33 },
];

const CHAPTER_POOL = [
  { bookId: 'PSA', bookName: 'Psalms', chapter: 23 }, { bookId: 'PSA', bookName: 'Psalms', chapter: 27 },
  { bookId: 'PSA', bookName: 'Psalms', chapter: 46 }, { bookId: 'PSA', bookName: 'Psalms', chapter: 91 },
  { bookId: 'PSA', bookName: 'Psalms', chapter: 103 }, { bookId: 'PSA', bookName: 'Psalms', chapter: 121 },
  { bookId: 'PRO', bookName: 'Proverbs', chapter: 3 }, { bookId: 'ISA', bookName: 'Isaiah', chapter: 40 },
  { bookId: 'MAT', bookName: 'Matthew', chapter: 5 }, { bookId: 'JHN', bookName: 'John', chapter: 1 },
  { bookId: 'JHN', bookName: 'John', chapter: 3 }, { bookId: 'ROM', bookName: 'Romans', chapter: 8 },
  { bookId: 'EPH', bookName: 'Ephesians', chapter: 2 }, { bookId: 'PHP', bookName: 'Philippians', chapter: 4 },
];

const BUNDLED_CHAPTERS = {
  PSA_23: [
    { number: 1, text: 'The LORD is my shepherd; I shall not want.' },
    { number: 2, text: 'He makes me lie down in green pastures; He leads me beside quiet waters.' },
    { number: 3, text: 'He restores my soul; He guides me in the paths of righteousness for the sake of His name.' },
    { number: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me.' },
    { number: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.' },
    { number: 6, text: 'Surely goodness and mercy will follow me all the days of my life, and I will dwell in the house of the LORD forever.' },
  ],
  PRO_3: [
    { number: 1, text: 'My son, do not forget my teaching, but let your heart keep my commandments;' },
    { number: 2, text: 'for they will add length to your days, years and peace to your life.' },
    { number: 3, text: 'Never let loving devotion or faithfulness leave you; bind them around your neck, write them on the tablet of your heart.' },
    { number: 4, text: 'Then you will find favor and high regard in the sight of God and man.' },
    { number: 5, text: 'Trust in the LORD with all your heart, and lean not on your own understanding;' },
    { number: 6, text: 'in all your ways acknowledge Him, and He will make your paths straight.' },
  ],
};

const BOOKS = [
  { id: 'GEN', name: 'Genesis', chapters: 50 }, { id: 'EXO', name: 'Exodus', chapters: 40 },
  { id: 'LEV', name: 'Leviticus', chapters: 27 }, { id: 'NUM', name: 'Numbers', chapters: 36 },
  { id: 'DEU', name: 'Deuteronomy', chapters: 34 }, { id: 'JOS', name: 'Joshua', chapters: 24 },
  { id: 'JDG', name: 'Judges', chapters: 21 }, { id: 'RUT', name: 'Ruth', chapters: 4 },
  { id: '1SA', name: '1 Samuel', chapters: 31 }, { id: '2SA', name: '2 Samuel', chapters: 24 },
  { id: '1KI', name: '1 Kings', chapters: 22 }, { id: '2KI', name: '2 Kings', chapters: 25 },
  { id: '1CH', name: '1 Chronicles', chapters: 29 }, { id: '2CH', name: '2 Chronicles', chapters: 36 },
  { id: 'EZR', name: 'Ezra', chapters: 10 }, { id: 'NEH', name: 'Nehemiah', chapters: 13 },
  { id: 'EST', name: 'Esther', chapters: 10 }, { id: 'JOB', name: 'Job', chapters: 42 },
  { id: 'PSA', name: 'Psalms', chapters: 150 }, { id: 'PRO', name: 'Proverbs', chapters: 31 },
  { id: 'ECC', name: 'Ecclesiastes', chapters: 12 }, { id: 'SNG', name: 'Song of Solomon', chapters: 8 },
  { id: 'ISA', name: 'Isaiah', chapters: 66 }, { id: 'JER', name: 'Jeremiah', chapters: 52 },
  { id: 'LAM', name: 'Lamentations', chapters: 5 }, { id: 'EZK', name: 'Ezekiel', chapters: 48 },
  { id: 'DAN', name: 'Daniel', chapters: 12 }, { id: 'HOS', name: 'Hosea', chapters: 14 },
  { id: 'JOL', name: 'Joel', chapters: 3 }, { id: 'AMO', name: 'Amos', chapters: 9 },
  { id: 'OBA', name: 'Obadiah', chapters: 1 }, { id: 'JON', name: 'Jonah', chapters: 4 },
  { id: 'MIC', name: 'Micah', chapters: 7 }, { id: 'NAM', name: 'Nahum', chapters: 3 },
  { id: 'HAB', name: 'Habakkuk', chapters: 3 }, { id: 'ZEP', name: 'Zephaniah', chapters: 3 },
  { id: 'HAG', name: 'Haggai', chapters: 2 }, { id: 'ZEC', name: 'Zechariah', chapters: 14 },
  { id: 'MAL', name: 'Malachi', chapters: 4 }, { id: 'MAT', name: 'Matthew', chapters: 28 },
  { id: 'MRK', name: 'Mark', chapters: 16 }, { id: 'LUK', name: 'Luke', chapters: 24 },
  { id: 'JHN', name: 'John', chapters: 21 }, { id: 'ACT', name: 'Acts', chapters: 28 },
  { id: 'ROM', name: 'Romans', chapters: 16 }, { id: '1CO', name: '1 Corinthians', chapters: 16 },
  { id: '2CO', name: '2 Corinthians', chapters: 13 }, { id: 'GAL', name: 'Galatians', chapters: 6 },
  { id: 'EPH', name: 'Ephesians', chapters: 6 }, { id: 'PHP', name: 'Philippians', chapters: 4 },
  { id: 'COL', name: 'Colossians', chapters: 4 }, { id: '1TH', name: '1 Thessalonians', chapters: 5 },
  { id: '2TH', name: '2 Thessalonians', chapters: 3 }, { id: '1TI', name: '1 Timothy', chapters: 6 },
  { id: '2TI', name: '2 Timothy', chapters: 4 }, { id: 'TIT', name: 'Titus', chapters: 3 },
  { id: 'PHM', name: 'Philemon', chapters: 1 }, { id: 'HEB', name: 'Hebrews', chapters: 13 },
  { id: 'JAS', name: 'James', chapters: 5 }, { id: '1PE', name: '1 Peter', chapters: 5 },
  { id: '2PE', name: '2 Peter', chapters: 3 }, { id: '1JN', name: '1 John', chapters: 5 },
  { id: '2JN', name: '2 John', chapters: 1 }, { id: '3JN', name: '3 John', chapters: 1 },
  { id: 'JUD', name: 'Jude', chapters: 1 }, { id: 'REV', name: 'Revelation', chapters: 22 },
];
const dateStr = (offset = 0) => {
  const d = new Date(Date.now() + offset * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dayOfYear = () => Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
const parseChapter = (data) => {
  const out = [];
  (data?.chapter?.content || []).forEach((item) => {
    if (item.type === 'verse') {
      const txt = (item.content || []).map((p) => (typeof p === 'string' ? p : p?.text || '')).join(' ').replace(/\s+/g, ' ').trim();
      if (txt) out.push({ number: item.number, text: txt });
    }
  });
  return out;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('signup');
  const [nameIn, setNameIn] = useState('');
  const [emailIn, setEmailIn] = useState('');
  const [passIn, setPassIn] = useState('');

  const [tab, setTab] = useState('today');
  const [daily, setDaily] = useState(VERSES[dayOfYear() % VERSES.length]);
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastDate: null, week: [false, false, false, false, false, false, false] });
  const [marks, setMarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteModal, setNoteModal] = useState(false);
  const [noteTarget, setNoteTarget] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [isPM, setIsPM] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [book, setBook] = useState(BOOKS.find((b) => b.id === daily.bookId) || BOOKS);
  const [chapter, setChapter] = useState(daily.chapter);
  const [hlVerse, setHlVerse] = useState(daily.verse);
  const [verses, setVerses] = useState([]);
  const [chLoading, setChLoading] = useState(false);
  const [offlineTag, setOfflineTag] = useState(false);
  const [cachedCount, setCachedCount] = useState(2);
  const [dlBusy, setDlBusy] = useState(false);
  const [dlText, setDlText] = useState('');
  const [chErr, setChErr] = useState('');
  const [picker, setPicker] = useState(false);
  const [restoreModal, setRestoreModal] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const respRef = useRef();

  useEffect(() => {
    init();
    respRef.current = Notifications.addNotificationResponseReceivedListener((r) => {
      const d = r?.notification?.request?.content?.data;
      if (d?.bookId && d?.chapter) {
        const b = BOOKS.find((x) => x.id === d.bookId);
        if (b) { setBook(b); setChapter(d.chapter); setHlVerse(d.verse || null); setTab('bible'); bumpStreak(); }
      }
    });
    return () => respRef.current && respRef.current.remove();
  }, []);

  useEffect(() => {
    if (tab === 'bible') loadChapter(book.id, chapter);
  }, [tab, book, chapter]);

  async function init() {
    try {
      const [u, sc, st, mk, nt, ca] = await Promise.all([
        AsyncStorage.getItem(KEYS.USER), AsyncStorage.getItem(KEYS.SCHED),
        AsyncStorage.getItem(KEYS.STREAK), AsyncStorage.getItem(KEYS.MARKS),
        AsyncStorage.getItem(KEYS.NOTES), AsyncStorage.getItem(KEYS.CACHE),
      ]);
      if (u) { const pu = JSON.parse(u); if (pu.loggedIn) setUser(pu); }
      if (sc) { const ps = JSON.parse(sc); setHour(ps.hour); setMinute(ps.minute); setIsPM(ps.isPM); setScheduled(true); }
      if (st) {
        const pst = JSON.parse(st);
        if (pst.lastDate && pst.lastDate !== dateStr(0) && pst.lastDate !== dateStr(-1)) pst.current = 0;
        setStreak(pst);
      }
      if (mk) setMarks(JSON.parse(mk));
      if (nt) setNotes(JSON.parse(nt));
      if (ca) setCachedCount(Object.keys({ ...BUNDLED_CHAPTERS, ...JSON.parse(ca) }).length);
      await fetch365Verse();
      await setupChannel();
    } finally { setLoading(false); }
  }

  async function fetch365Verse() {
    const today = dateStr(0);
    try {
      const raw = await AsyncStorage.getItem(KEYS.DAILY);
      const map = raw ? JSON.parse(raw) : {};
      if (map[today]) { setDaily(map[today]); return; }
      const d = dayOfYear();
      const target = CHAPTER_POOL[d % CHAPTER_POOL.length];
      const res = await fetch(`https://bible.helloao.org/api/BSB/${target.bookId}/${target.chapter}.json`);
      if (!res.ok) return;
      const list = parseChapter(await res.json());
      if (list.length) {
        const picked = list[(d * 7) % list.length];
        const vObj = { text: picked.text, reference: `${target.bookName} ${target.chapter}:${picked.number}`, bookId: target.bookId, bookName: target.bookName, chapter: target.chapter, verse: picked.number };
        map[today] = vObj;
        await AsyncStorage.setItem(KEYS.DAILY, JSON.stringify(map));
        setDaily(vObj);
        const cRaw = await AsyncStorage.getItem(KEYS.CACHE);
        const cObj = cRaw ? JSON.parse(cRaw) : {};
        cObj[`${target.bookId}_${target.chapter}`] = list;
        await AsyncStorage.setItem(KEYS.CACHE, JSON.stringify(cObj));
        setCachedCount(Object.keys({ ...BUNDLED_CHAPTERS, ...cObj }).length);
      }
    } catch (e) {}
  }

  async function downloadOfflinePack() {
    if (dlBusy) return;
    setDlBusy(true);
    try {
      const cRaw = await AsyncStorage.getItem(KEYS.CACHE);
      const cObj = cRaw ? JSON.parse(cRaw) : {};
         const pack = BOOKS;
   let done = 0;
   const total = pack.reduce((s, b) => s + b.chapters, 0);
   for (const b of pack) {
     for (let c = 1; c <= b.chapters; c++) {
       done++;
       const k = `${b.id}_${c}`;
       if (!cObj[k]) {
         setDlText(`Saving ${b.name} (${done}/${total})...`);
         const r = await fetch(`https://bible.helloao.org/api/BSB/${b.id}/${c}.json`);
         if (r.ok) cObj[k] = parseChapter(await r.json());
       }
     }
   }
      await AsyncStorage.setItem(KEYS.CACHE, JSON.stringify(cObj));
      setCachedCount(Object.keys({ ...BUNDLED_CHAPTERS, ...cObj }).length);
      setDlText('');
      Alert.alert('Offline Bible Ready ✓', 'Matthew, John, Romans, Ephesians, Philippians, James & Proverbs are now saved offline!');
    } catch (e) {
      setDlText('');
      Alert.alert('Connect Once', 'Please connect to internet once to download the offline pack.');
    } finally { setDlBusy(false); }
  }

  async function bumpStreak() {
    const today = dateStr(0);
    const yest = dateStr(-1);
    setStreak((prev) => {
      if (prev.lastDate === today) return prev;
      const cur = prev.lastDate === yest ? prev.current + 1 : 1;
      const lng = Math.max(prev.longest, cur);
      const idx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
      const wk = [...prev.week];
      wk[idx] = true;
      const next = { current: cur, longest: lng, lastDate: today, week: wk };
      AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(next));
      return next;
    });
  }

  async function submitAuth() {
    const em = emailIn.trim().toLowerCase();
    if (!em || !passIn.trim()) return Alert.alert('Missing Info', 'Enter your email and password.');
    const raw = await AsyncStorage.getItem(KEYS.USER);
    if (authMode === 'login') {
      if (!raw) return Alert.alert('No Account', 'Tap Create Account first.');
      const ex = JSON.parse(raw);
      if (ex.email !== em || ex.password !== passIn) return Alert.alert('Wrong Login', 'Email or password did not match.');
      const u = { ...ex, loggedIn: true };
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(u));
      setUser(u);
    } else {
      const u = { name: nameIn.trim() || 'Believer', email: em, password: passIn, loggedIn: true };
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(u));
      setUser(u);
    }
    bumpStreak();
  }

  async function toggleBookmark(item) {
    const exists = marks.some((m) => m.id === item.id);
    const next = exists ? marks.filter((m) => m.id !== item.id) : [item, ...marks];
    setMarks(next);
    await AsyncStorage.setItem(KEYS.MARKS, JSON.stringify(next));
    bumpStreak();
  }

  function openNote(item) {
    const found = notes.find((n) => n.verseId === item.id);
    setNoteTarget(item);
    setNoteDraft(found ? found.content : '');
    setNoteModal(true);
  }

  async function saveNote() {
    if (!noteTarget) return;
    const txt = noteDraft.trim();
    const rest = notes.filter((n) => n.verseId !== noteTarget.id);
    const next = txt ? [{ verseId: noteTarget.id, reference: noteTarget.reference, verseText: noteTarget.text, bookId: noteTarget.bookId, chapter: noteTarget.chapter, verse: noteTarget.verse, content: txt }, ...rest] : rest;
    setNotes(next);
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(next));
    setNoteModal(false);
    bumpStreak();
  }
    async function setupChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Mea Lux Daily Scripture',
        importance: Notifications.AndroidImportance.MAX,
        lightColor: '#E8B86D',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        sound: 'default',
      });
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') await Notifications.requestPermissionsAsync();
  }

  async function scheduleAlarm() {
    try {
      await setupChannel();
      await Notifications.cancelAllScheduledNotificationsAsync();
      const h24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `✦ Mea Lux • ${daily.reference} (BSB)`,
          body: daily.text,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { bookId: daily.bookId, chapter: daily.chapter, verse: daily.verse },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: h24, minute, channelId: CHANNEL_ID },
      });
      await AsyncStorage.setItem(KEYS.SCHED, JSON.stringify({ hour, minute, isPM }));
      setScheduled(true);
      setStatusMsg(`Daily alarm active for ${hour}:${minute < 10 ? '0' + minute : minute} ${isPM ? 'PM' : 'AM'}`);
    } catch (e) { Alert.alert('Error', e.message); }
  }

  async function testBackgroundAlert() {
    await setupChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `✦ Mea Lux • ${daily.reference} (BSB)`,
        body: daily.text,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { bookId: daily.bookId, chapter: daily.chapter, verse: daily.verse },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(Date.now() + 5000), channelId: CHANNEL_ID },
    });
    setStatusMsg('Go to Home screen now—fires in 5s!');
  }

  async function loadChapter(bId, chNum) {
    setChLoading(true);
    setChErr('');
    const k = `${bId}_${chNum}`;
    try {
      const cRaw = await AsyncStorage.getItem(KEYS.CACHE);
      const cObj = cRaw ? JSON.parse(cRaw) : {};
      if (cObj[k]) { setVerses(cObj[k]); setOfflineTag(true); setChLoading(false); bumpStreak(); return; }
      if (BUNDLED_CHAPTERS[k]) { setVerses(BUNDLED_CHAPTERS[k]); setOfflineTag(true); setChLoading(false); bumpStreak(); return; }
      const res = await fetch(`https://helloao.org{bId}/${chNum}.json`);
      if (!res.ok) throw new Error('Offline');
      const parsed = parseChapter(await res.json());
      cObj[k] = parsed;
      await AsyncStorage.setItem(KEYS.CACHE, JSON.stringify(cObj));
      setCachedCount(Object.keys({ ...BUNDLED_CHAPTERS, ...cObj }).length);
      setVerses(parsed);
      setOfflineTag(false);
      bumpStreak();
    } catch (e) {
      setChErr('Offline: open this chapter once with internet—or tap Download Offline Pack in Account!');
    } finally { setChLoading(false); }
  }

  const jumpToBible = (bId, ch, v) => {
    const b = BOOKS.find((x) => x.id === bId) || BOOKS[0];
    setBook(b); setChapter(ch); setHlVerse(v); setTab('bible'); bumpStreak();
  };

  if (loading) return <SafeAreaView style={s.container}><View style={s.center}><ActivityIndicator size="large" color="#E8B86D" /></View></SafeAreaView>;

  if (!user) {
    return (
      <SafeAreaView style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
        <ScrollView contentContainerStyle={s.authWrap}>
          <View style={s.orbLg}><Text style={s.starLg}>✦</Text></View>
          <Text style={s.titleLg}>MEA LUX</Text>
          <Text style={s.subLg}>365 Daily Scriptures • Offline BSB Bible • Prayer Journal</Text>
          <View style={s.card}>
            <View style={s.rowGap}>
              {['signup', 'login'].map((m) => (
                <TouchableOpacity key={m} style={[s.togBtn, authMode === m && s.togOn]} onPress={() => setAuthMode(m)}>
                  <Text style={[s.togTxt, authMode === m && s.togTxtOn]}>{m === 'signup' ? 'Create Account' : 'Log In'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {authMode === 'signup' && <TextInput style={s.input} placeholder="First Name" placeholderTextColor="#6E778A" value={nameIn} onChangeText={setNameIn} />}
            <TextInput style={s.input} placeholder="Email" placeholderTextColor="#6E778A" autoCapitalize="none" value={emailIn} onChangeText={setEmailIn} />
            <TextInput style={s.input} placeholder="Password" placeholderTextColor="#6E778A" secureTextEntry value={passIn} onChangeText={setPassIn} />
            <TouchableOpacity style={s.goldBtn} onPress={submitAuth}>
              <Text style={s.goldBtnTxt}>{authMode === 'signup' ? 'Start My Journey ✦' : 'Log In'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
    const vId = `${daily.bookId}_${daily.chapter}_${daily.verse}`;
  const isSaved = marks.some((m) => m.id === vId);
  const hasNote = notes.some((n) => n.verseId === vId);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
      <View style={s.header}>
        <View>
          <Text style={s.brand}>MEA LUX</Text>
          <Text style={s.subBrand}>WELCOME, {user.name.toUpperCase()}</Text>
        </View>
        <View style={s.streakPill}>
          <Text style={s.streakTxt}>🔥 {streak.current} {streak.current === 1 ? 'DAY' : 'DAYS'}</Text>
        </View>
      </View>

      {tab === 'today' && (
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.card}>
            <View style={s.rowBetween}>
              <Text style={s.habitTitle}>{streak.lastDate === dateStr(0) ? 'Daily Scripture Complete ✨' : 'Read today to keep your flame lit'}</Text>
              <Text style={s.goldTxt}>Best: {streak.longest}d</Text>
            </View>
            <View style={[s.rowBetween, { marginTop: 12 }]}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <View key={i} style={{ alignItems: 'center' }}>
                  <View style={[s.dayDot, streak.week[i] && s.dayDotOn]}><Text style={s.goldTxt}>{streak.week[i] ? '🔥' : '•'}</Text></View>
                  <Text style={s.muted}>{d}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.cardGold}>
            <View style={s.rowBetween}>
              <Text style={s.kickerGold}>✦ TODAY&apos;S LIGHT</Text>
              <Text style={s.muted}>{daily.reference}</Text>
            </View>
            <Text style={s.verseTxt}>“{daily.text}”</Text>
            <View style={[s.rowGap, { marginTop: 14 }]}>
              <TouchableOpacity style={[s.pill, isSaved && s.pillOn]} onPress={() => toggleBookmark({ id: vId, ...daily })}>
                <Text style={s.goldTxt}>{isSaved ? '🔖 Saved' : '🔖 Bookmark'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.pill, hasNote && s.pillOn]} onPress={() => openNote({ id: vId, ...daily })}>
                <Text style={s.goldTxt}>{hasNote ? '📝 Edit Note' : '📝 Add Note'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[s.outlineBtn, { marginTop: 14 }]} onPress={() => jumpToBible(daily.bookId, daily.chapter, daily.verse)}>
              <Text style={s.goldTxt}>Read {daily.bookName} {daily.chapter} in BSB Bible →</Text>
            </TouchableOpacity>
          </View>

          <View style={s.card}>
            <Text style={s.sectionKicker}>DAILY DELIVERY TIME</Text>
            <View style={s.timeRow}>
              <View style={s.colCenter}>
                <TouchableOpacity onPress={() => { setScheduled(false); setHour(hour === 12 ? 1 : hour + 1); }}><Text style={s.goldTxt}>▲</Text></TouchableOpacity>
                <Text style={s.digit}>{hour < 10 ? `0${hour}` : hour}</Text>
                <TouchableOpacity onPress={() => { setScheduled(false); setHour(hour === 1 ? 12 : hour - 1); }}><Text style={s.goldTxt}>▼</Text></TouchableOpacity>
              </View>
              <Text style={s.digit}>:</Text>
              <View style={s.colCenter}>
                <TouchableOpacity onPress={() => { setScheduled(false); setMinute(minute === 59 ? 0 : minute + 1); }}><Text style={s.goldTxt}>▲</Text></TouchableOpacity>
                <Text style={s.digit}>{minute < 10 ? `0${minute}` : minute}</Text>
                <TouchableOpacity onPress={() => { setScheduled(false); setMinute(minute === 0 ? 59 : minute - 1); }}><Text style={s.goldTxt}>▼</Text></TouchableOpacity>
              </View>
              <TouchableOpacity style={s.ampm} onPress={() => { setScheduled(false); setIsPM(!isPM); }}>
                <Text style={s.goldTxt}>{isPM ? 'PM' : 'AM'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[s.goldBtn, scheduled && s.outlineBtn]} onPress={scheduleAlarm}>
              <Text style={scheduled ? s.goldTxt : s.goldBtnTxt}>
                {scheduled ? `Scheduled for ${hour}:${minute < 10 ? '0' + minute : minute} ${isPM ? 'PM' : 'AM'} ✓` : 'Set Daily Notification'}
              </Text>
            </TouchableOpacity>
            {statusMsg ? <Text style={[s.muted, { textAlign: 'center', marginTop: 10 }]}>{statusMsg}</Text> : null}
          </View>

          <TouchableOpacity style={{ marginTop: 14, alignItems: 'center' }} onPress={testBackgroundAlert}>
            <Text style={[s.muted, { textDecorationLine: 'underline' }]}>Test Background Lock-Screen Alert (5s)</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {tab === 'bible' && (
        <View style={{ flex: 1 }}>
          <View style={s.bibleBar}>
            <TouchableOpacity style={s.pillOn} onPress={() => setPicker(true)}>
              <Text style={s.goldTxt}>{book.name} {chapter} ▾</Text>
            </TouchableOpacity>
            <View style={s.rowGap}>
              <TouchableOpacity style={s.pill} disabled={chapter <= 1} onPress={() => { setHlVerse(null); setChapter(chapter - 1); }}>
                <Text style={s.lightTxt}>‹ Prev</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.pill} disabled={chapter >= book.chapters} onPress={() => { setHlVerse(null); setChapter(chapter + 1); }}>
                <Text style={s.lightTxt}>Next ›</Text>
              </TouchableOpacity>
            </View>
          </View>
          {chLoading ? (
            <View style={s.center}><ActivityIndicator size="large" color="#E8B86D" /></View>
          ) : chErr ? (
            <View style={s.center}>
              <Text style={[s.goldTxt, { textAlign: 'center', marginBottom: 14 }]}>{chErr}</Text>
              <TouchableOpacity style={s.goldBtn} onPress={() => loadChapter(book.id, chapter)}><Text style={s.goldBtnTxt}>Retry</Text></TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={s.scroll}>
              <Text style={s.chTitle}>{book.name} {chapter}</Text>
              <Text style={[s.goldTxt, { fontSize: 12, marginBottom: 14 }]}>Berean Standard Bible • {offlineTag ? 'Saved Offline ✓' : 'Synced Offline ✓'}</Text>
              {verses.map((v) => {
                const id = `${book.id}_${chapter}_${v.number}`;
                const sv = marks.some((m) => m.id === id);
                const nt = notes.find((n) => n.verseId === id);
                return (
                  <View key={v.number} style={[s.vRow, (v.number === hlVerse || sv || nt) && s.vRowHl]}>
                    <Text style={s.bVerse}><Text style={s.goldTxt}>{v.number} </Text>{v.text}</Text>
                    <View style={[s.rowGap, { marginTop: 6 }]}>
                      <TouchableOpacity onPress={() => toggleBookmark({ id, reference: `${book.name} ${chapter}:${v.number}`, text: v.text, bookId: book.id, chapter, verse: v.number })}>
                        <Text style={s.toolTxt}>{sv ? '🔖 Saved' : '🔖 Bookmark'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openNote({ id, reference: `${book.name} ${chapter}:${v.number}`, text: v.text, bookId: book.id, chapter, verse: v.number })}>
                        <Text style={s.toolTxt}>{nt ? '📝 Edit Note' : '📝 Note'}</Text>
                      </TouchableOpacity>
                    </View>
                    {nt ? <Text style={s.notePreview}>“{nt.content}”</Text> : null}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {tab === 'journal' && (
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.chTitle}>Study Notes ({notes.length})</Text>
          {notes.length === 0 ? <Text style={s.muted}>Tap Note on any verse to write a reflection.</Text> : notes.map((n) => (
            <View key={n.verseId} style={s.card}>
              <View style={s.rowBetween}>
                <Text style={s.goldTxt}>{n.reference}</Text>
                <TouchableOpacity onPress={() => openNote({ id: n.verseId, reference: n.reference, text: n.verseText, bookId: n.bookId, chapter: n.chapter, verse: n.verse })}><Text style={s.muted}>Edit</Text></TouchableOpacity>
              </View>
              <Text style={s.lightTxt}>{n.content}</Text>
            </View>
          ))}
          <Text style={[s.chTitle, { marginTop: 20 }]}>Bookmarks ({marks.length})</Text>
          {marks.length === 0 ? <Text style={s.muted}>Tap Bookmark on any verse to save it here.</Text> : marks.map((b) => (
            <TouchableOpacity key={b.id} style={s.card} onPress={() => jumpToBible(b.bookId, b.chapter, b.verse)}>
              <Text style={s.goldTxt}>🔖 {b.reference}</Text>
              <Text style={s.lightTxt}>“{b.text}”</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {tab === 'profile' && (
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.cardGold}>
            <Text style={s.chTitle}>{user.name}</Text>
            <Text style={[s.muted, { marginBottom: 16 }]}>{user.email}</Text>
            <View style={[s.rowBetween, { marginBottom: 18 }]}>
              <View style={s.colCenter}><Text style={s.goldTxt}>🔥 {streak.current}</Text><Text style={s.muted}>Streak</Text></View>
              <View style={s.colCenter}><Text style={s.goldTxt}>{notes.length}</Text><Text style={s.muted}>Notes</Text></View>
              <View style={s.colCenter}><Text style={s.goldTxt}>{cachedCount}</Text><Text style={s.muted}>Offline Ch.</Text></View>
            </View>
            <TouchableOpacity style={[s.goldBtn, { marginBottom: 10 }]} onPress={downloadOfflinePack} disabled={dlBusy}>
                          <Text style={s.goldBtnTxt}>{dlBusy ? dlText : '📥 Download Offline Bible Pack'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.outlineBtn, { marginBottom: 10 }]} onPress={() => Share.share({ message: JSON.stringify({ streak, marks, notes }) })}>
              <Text style={s.goldTxt}>☁️ Back Up Notes & Streak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.outlineBtn} onPress={() => setRestoreModal(true)}>
              <Text style={s.goldTxt}>🔄 Restore Backup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 18, alignItems: 'center' }} onPress={async () => { const u = { ...user, loggedIn: false }; await AsyncStorage.setItem(KEYS.USER, JSON.stringify(u)); setUser(null); }}>
              <Text style={{ color: '#D96B6B', fontWeight: '700' }}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <View style={s.nav}>
        {[['today', '✦ Today'], ['bible', '📖 Bible'], ['journal', '📝 Notes'], ['profile', '👤 Account']].map(([k, lbl]) => (
          <TouchableOpacity key={k} style={[s.navBtn, tab === k && s.navOn]} onPress={() => setTab(k)}>
            <Text style={[s.navTxt, tab === k && s.navTxtOn]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={picker} animationType="slide" transparent onRequestClose={() => setPicker(false)}>
        <View style={s.modalBg}>
          <View style={s.sheet}>
            <View style={s.rowBetween}>
              <Text style={s.chTitle}>Select Book & Chapter</Text>
              <TouchableOpacity onPress={() => setPicker(false)}><Text style={s.goldTxt}>Done</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, marginVertical: 10 }}>
              {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
                <TouchableOpacity key={c} style={[s.chip, chapter === c && s.chipOn]} onPress={() => { setHlVerse(null); setChapter(c); setPicker(false); }}>
                  <Text style={chapter === c ? s.goldBtnTxt : s.lightTxt}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView>
              {BOOKS.map((b) => (
                <TouchableOpacity key={b.id} style={[s.bookRow, b.id === book.id && s.pillOn]} onPress={() => { setHlVerse(null); setBook(b); setChapter(1); }}>
                  <Text style={b.id === book.id ? s.goldTxt : s.lightTxt}>{b.name}</Text>
                  <Text style={s.muted}>{b.chapters} ch</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={noteModal} animationType="slide" transparent onRequestClose={() => setNoteModal(false)}>
        <View style={s.modalBg}>
          <View style={s.sheet}>
            <View style={s.rowBetween}>
              <Text style={s.goldTxt}>Note • {noteTarget?.reference}</Text>
              <TouchableOpacity onPress={() => setNoteModal(false)}><Text style={s.muted}>Cancel</Text></TouchableOpacity>
            </View>
            <TextInput style={s.area} multiline placeholder="Write your prayer or reflection..." placeholderTextColor="#6E778A" value={noteDraft} onChangeText={setNoteDraft} />
            <TouchableOpacity style={s.goldBtn} onPress={saveNote}><Text style={s.goldBtnTxt}>Save Note ✓</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={restoreModal} animationType="slide" transparent onRequestClose={() => setRestoreModal(false)}>
        <View style={s.modalBg}>
          <View style={s.sheet}>
            <View style={s.rowBetween}>
              <Text style={s.goldTxt}>Paste Backup Text</Text>
              <TouchableOpacity onPress={() => setRestoreModal(false)}><Text style={s.muted}>Close</Text></TouchableOpacity>
            </View>
            <TextInput style={s.area} multiline placeholder="Paste exported JSON here..." placeholderTextColor="#6E778A" value={restoreText} onChangeText={setRestoreText} />
            <TouchableOpacity style={s.goldBtn} onPress={async () => {
              try {
                const p = JSON.parse(restoreText.trim());
                if (p.marks) { setMarks(p.marks); await AsyncStorage.setItem(KEYS.MARKS, JSON.stringify(p.marks)); }
                if (p.notes) { setNotes(p.notes); await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(p.notes)); }
                if (p.streak) { setStreak(p.streak); await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(p.streak)); }
                setRestoreModal(false); Alert.alert('Restored ✓', 'Your data is back.');
              } catch (e) { Alert.alert('Invalid Text', 'Could not read backup.'); }
            }}><Text style={s.goldBtnTxt}>Restore Now</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D12' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { padding: 18, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1B202C' },
  brand: { color: '#F5EFE6', fontSize: 20, fontWeight: '700', letterSpacing: 3 },
  subBrand: { color: '#8E96A8', fontSize: 10, letterSpacing: 1.5, marginTop: 2 },
  streakPill: { backgroundColor: 'rgba(232,184,109,0.16)', borderWidth: 1, borderColor: '#E8B86D', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  streakTxt: { color: '#E8B86D', fontWeight: '800', fontSize: 13 },
  card: { backgroundColor: '#141821', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#1F2533', marginBottom: 16 },
  cardGold: { backgroundColor: '#141821', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(232,184,109,0.45)', marginBottom: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowGap: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  colCenter: { alignItems: 'center', width: 56 },
  habitTitle: { color: '#E6DFD3', fontSize: 13, fontWeight: '600' },
  dayDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1C2230', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  dayDotOn: { backgroundColor: 'rgba(232,184,109,0.25)', borderWidth: 1, borderColor: '#E8B86D' },
  kickerGold: { color: '#E8B86D', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  sectionKicker: { color: '#8E96A8', fontSize: 11, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginBottom: 12 },
  verseTxt: { color: '#FAF6EE', fontSize: 19, lineHeight: 29, marginTop: 12 },
  pill: { backgroundColor: '#1C2230', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#2A3244' },
  pillOn: { backgroundColor: 'rgba(232,184,109,0.18)', borderColor: '#E8B86D', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  goldBtn: { backgroundColor: '#E8B86D', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  goldBtnTxt: { color: '#0B0D12', fontSize: 15, fontWeight: '700' },
  outlineBtn: { backgroundColor: 'rgba(232,184,109,0.12)', borderWidth: 1, borderColor: '#E8B86D', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  goldTxt: { color: '#E8B86D', fontWeight: '700' },
  lightTxt: { color: '#EAE4D7', fontSize: 15, lineHeight: 22 },
  muted: { color: '#8E96A8', fontSize: 12 },
  timeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  digit: { color: '#FAF6EE', fontSize: 34, fontWeight: '700' },
  ampm: { backgroundColor: '#1E2433', borderWidth: 1, borderColor: '#E8B86D', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginLeft: 10 },
  bibleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#11151E', borderBottomWidth: 1, borderBottomColor: '#1D2330' },
  chTitle: { color: '#FAF6EE', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  vRow: { padding: 10, borderRadius: 12, marginBottom: 8, backgroundColor: '#11151E' },
  vRowHl: { backgroundColor: 'rgba(232,184,109,0.15)', borderLeftWidth: 3, borderLeftColor: '#E8B86D' },
  bVerse: { color: '#EAE4D7', fontSize: 16, lineHeight: 25 },
  toolTxt: { color: '#E8B86D', fontSize: 12, fontWeight: '600' },
  notePreview: { color: '#D6CFC2', fontSize: 13, fontStyle: 'italic', marginTop: 6 },
  nav: { flexDirection: 'row', backgroundColor: '#11151E', borderTopWidth: 1, borderTopColor: '#1E2433', padding: 8, gap: 6 },
  navBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: '#171C28' },
  navOn: { backgroundColor: '#E8B86D' },
  navTxt: { color: '#9AA3B5', fontSize: 12, fontWeight: '700' },
  navTxtOn: { color: '#0B0D12' },
  authWrap: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  orbLg: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(232,184,109,0.16)', borderWidth: 1, borderColor: '#E8B86D', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 12 },
  starLg: { color: '#E8B86D', fontSize: 26 },
  titleLg: { color: '#FAF6EE', fontSize: 26, fontWeight: '700', letterSpacing: 4, textAlign: 'center' },
  subLg: { color: '#8E96A8', fontSize: 12, textAlign: 'center', marginTop: 6, marginBottom: 22 },
  togBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1C2230', alignItems: 'center', marginBottom: 14 },
  togOn: { backgroundColor: '#E8B86D' },
  togTxt: { color: '#9AA3B5', fontWeight: '700' },
  togTxtOn: { color: '#0B0D12' },
    input: { backgroundColor: '#0B0D12', borderWidth: 1, borderColor: '#252C3D', borderRadius: 12, padding: 12, color: '#FAF6EE', marginBottom: 12 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#141821', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%', borderTopWidth: 1, borderColor: '#E8B86D' },
  chip: { backgroundColor: '#1E2433', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 8 },
  chipOn: { backgroundColor: '#E8B86D' },
  bookRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 10 },
  area: { backgroundColor: '#0B0D12', borderWidth: 1, borderColor: '#252C3D', borderRadius: 14, padding: 14, color: '#FAF6EE', minHeight: 110, textAlignVertical: 'top', marginVertical: 12 },
});

  
            
  
  
  

