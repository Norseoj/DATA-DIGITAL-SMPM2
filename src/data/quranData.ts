export interface SurahDetail {
  nama: string;
  startAyat: number;
  endAyat: number;
}

export interface JuzDetail {
  juz: number;
  surahs: SurahDetail[];
}

export const quranData: JuzDetail[] = [
  {
    juz: 1,
    surahs: [
      { nama: "الفاتحة (Al-Fātiḥah)", startAyat: 1, endAyat: 7 },
      { nama: "البقرة (Al-Baqarah)", startAyat: 1, endAyat: 141 }
    ]
  },
  {
    juz: 2,
    surahs: [
      { nama: "البقرة (Al-Baqarah)", startAyat: 142, endAyat: 252 }
    ]
  },
  {
    juz: 3,
    surahs: [
      { nama: "البقرة (Al-Baqarah)", startAyat: 253, endAyat: 286 },
      { nama: "آل عمران (Āli ‘Imrān)", startAyat: 1, endAyat: 92 }
    ]
  },
  {
    juz: 4,
    surahs: [
      { nama: "آل عمران (Āli ‘Imrān)", startAyat: 93, endAyat: 200 },
      { nama: "النساء (An-Nisā’)", startAyat: 1, endAyat: 23 }
    ]
  },
  {
    juz: 5,
    surahs: [
      { nama: "النساء (An-Nisā’)", startAyat: 24, endAyat: 147 }
    ]
  },
  {
    juz: 6,
    surahs: [
      { nama: "النساء (An-Nisā’)", startAyat: 148, endAyat: 176 },
      { nama: "المائدة (Al-Mā’idah)", startAyat: 1, endAyat: 81 }
    ]
  },
  {
    juz: 7,
    surahs: [
      { nama: "المائدة (Al-Mā’idah)", startAyat: 82, endAyat: 120 },
      { nama: "الأنعام (Al-An‘ām)", startAyat: 1, endAyat: 110 }
    ]
  },
  {
    juz: 8,
    surahs: [
      { nama: "الأنعام (Al-An‘ām)", startAyat: 111, endAyat: 165 },
      { nama: "الأعراف (Al-A‘rāf)", startAyat: 1, endAyat: 87 }
    ]
  },
  {
    juz: 9,
    surahs: [
      { nama: "الأعراف (Al-A‘rāf)", startAyat: 88, endAyat: 206 },
      { nama: "الأنفال (Al-Anfāl)", startAyat: 1, endAyat: 40 }
    ]
  },
  {
    juz: 10,
    surahs: [
      { nama: "الأنفال (Al-Anfāl)", startAyat: 41, endAyat: 75 },
      { nama: "التوبة (At-Tawbah)", startAyat: 1, endAyat: 92 }
    ]
  },
  {
    juz: 11,
    surahs: [
      { nama: "التوبة (At-Tawbah)", startAyat: 93, endAyat: 129 },
      { nama: "يونس (Yūnus)", startAyat: 1, endAyat: 109 },
      { nama: "هود (Hūd)", startAyat: 1, endAyat: 5 }
    ]
  },
  {
    juz: 12,
    surahs: [
      { nama: "هود (Hūd)", startAyat: 6, endAyat: 123 },
      { nama: "يوسف (Yūsuf)", startAyat: 1, endAyat: 52 }
    ]
  },
  {
    juz: 13,
    surahs: [
      { nama: "يوسف (Yūsuf)", startAyat: 53, endAyat: 111 },
      { nama: "الرعد (Ar-Ra‘d)", startAyat: 1, endAyat: 43 },
      { nama: "إبراهيم (Ibrāhīm)", startAyat: 1, endAyat: 52 }
    ]
  },
  {
    juz: 14,
    surahs: [
      { nama: "الحجر (Al-Ḥijr)", startAyat: 1, endAyat: 99 },
      { nama: "النحل (An-Naḥl)", startAyat: 1, endAyat: 128 }
    ]
  },
  {
    juz: 15,
    surahs: [
      { nama: "الإسراء (Al-Isrā’)", startAyat: 1, endAyat: 111 },
      { nama: "الكهف (Al-Kahf)", startAyat: 1, endAyat: 74 }
    ]
  },
  {
    juz: 16,
    surahs: [
      { nama: "الكهف (Al-Kahf)", startAyat: 75, endAyat: 110 },
      { nama: "مريم (Maryam)", startAyat: 1, endAyat: 98 },
      { nama: "طه (Ṭāhā)", startAyat: 1, endAyat: 135 }
    ]
  },
  {
    juz: 17,
    surahs: [
      { nama: "الأنبياء (Al-Anbiyā’)", startAyat: 1, endAyat: 112 },
      { nama: "الحج (Al-Ḥajj)", startAyat: 1, endAyat: 78 }
    ]
  },
  {
    juz: 18,
    surahs: [
      { nama: "المؤمنون (Al-Mu’minūn)", startAyat: 1, endAyat: 118 },
      { nama: "النور (An-Nūr)", startAyat: 1, endAyat: 64 },
      { nama: "الفرقان (Al-Furqān)", startAyat: 1, endAyat: 20 }
    ]
  },
  {
    juz: 19,
    surahs: [
      { nama: "الفرقان (Al-Furqān)", startAyat: 21, endAyat: 77 },
      { nama: "الشعراء (Ash-Shu‘arā’)", startAyat: 1, endAyat: 227 },
      { nama: "النمل (An-Naml)", startAyat: 1, endAyat: 55 }
    ]
  },
  {
    juz: 20,
    surahs: [
      { nama: "النمل (An-Naml)", startAyat: 56, endAyat: 93 },
      { nama: "القصص (Al-Qaṣaṣ)", startAyat: 1, endAyat: 88 },
      { nama: "العنكبوت (Al-‘Ankabūt)", startAyat: 1, endAyat: 45 }
    ]
  },
  {
    juz: 21,
    surahs: [
      { nama: "العنكبوت (Al-‘Ankabūt)", startAyat: 46, endAyat: 69 },
      { nama: "الروم (Ar-Rūm)", startAyat: 1, endAyat: 60 },
      { nama: "لقمان (Luqmān)", startAyat: 1, endAyat: 34 },
      { nama: "السجدة (As-Sajdah)", startAyat: 1, endAyat: 30 },
      { nama: "الأحزاب (Al-Aḥzāb)", startAyat: 1, endAyat: 30 }
    ]
  },
  {
    juz: 22,
    surahs: [
      { nama: "الأحزاب (Al-Aḥzāb)", startAyat: 31, endAyat: 73 },
      { nama: "سبإ (Saba’)", startAyat: 1, endAyat: 54 },
      { nama: "فاطر (Fāṭir)", startAyat: 1, endAyat: 45 },
      { nama: "يس (Yāsīn)", startAyat: 1, endAyat: 27 }
    ]
  },
  {
    juz: 23,
    surahs: [
      { nama: "يس (Yāsīn)", startAyat: 28, endAyat: 83 },
      { nama: "الصافات (Aṣ-Ṣāffāt)", startAyat: 1, endAyat: 182 },
      { nama: "ص (Ṣād)", startAyat: 1, endAyat: 88 },
      { nama: "الزمر (Az-Zumar)", startAyat: 1, endAyat: 31 }
    ]
  },
  {
    juz: 24,
    surahs: [
      { nama: "الزمر (Az-Zumar)", startAyat: 32, endAyat: 75 },
      { nama: "غافر (Ghāfir)", startAyat: 1, endAyat: 85 },
      { nama: "فصلت (Fuṣṣilat)", startAyat: 1, endAyat: 46 }
    ]
  },
  {
    juz: 25,
    surahs: [
      { nama: "فصلت (Fuṣṣilat)", startAyat: 47, endAyat: 54 },
      { nama: "الشورى (Ash-Shūrā)", startAyat: 1, endAyat: 53 },
      { nama: "الزخرف (Az-Zukhruf)", startAyat: 1, endAyat: 89 },
      { nama: "الدخان (Ad-Dukhān)", startAyat: 1, endAyat: 59 },
      { nama: "الجاثية (Al-Jāthiyah)", startAyat: 1, endAyat: 37 }
    ]
  },
  {
    juz: 26,
    surahs: [
      { nama: "الأحقاف (Al-Aḥqāf)", startAyat: 1, endAyat: 35 },
      { nama: "محمد (Muḥammad)", startAyat: 1, endAyat: 38 },
      { nama: "الفتح (Al-Fatḥ)", startAyat: 1, endAyat: 29 },
      { nama: "الحجرات (Al-Ḥujurāt)", startAyat: 1, endAyat: 18 },
      { nama: "ق (Qāf)", startAyat: 1, endAyat: 45 },
      { nama: "الذاريات (Adh-Dhāriyāt)", startAyat: 1, endAyat: 30 }
    ]
  },
  {
    juz: 27,
    surahs: [
      { nama: "الذاريات (Adh-Dhāriyāt)", startAyat: 31, endAyat: 60 },
      { nama: "الطور (Aṭ-Ṭūr)", startAyat: 1, endAyat: 49 },
      { nama: "النجم (An-Najm)", startAyat: 1, endAyat: 62 },
      { nama: "القمر (Al-Qamar)", startAyat: 1, endAyat: 55 },
      { nama: "الرحمن (Ar-Raḥmān)", startAyat: 1, endAyat: 78 },
      { nama: "الواقعة (Al-Wāqi‘ah)", startAyat: 1, endAyat: 96 },
      { nama: "الحديد (Al-Ḥadīd)", startAyat: 1, endAyat: 29 }
    ]
  },
  {
    juz: 28,
    surahs: [
      { nama: "المجادلة (Al-Mujādilah)", startAyat: 1, endAyat: 22 },
      { nama: "الحشر (Al-Ḥashr)", startAyat: 1, endAyat: 24 },
      { nama: "الممتحنة (Al-Mumtaḥanah)", startAyat: 1, endAyat: 13 },
      { nama: "الصف (Aṣ-Ṣaff)", startAyat: 1, endAyat: 14 },
      { nama: "الجمعة (Al-Jumu‘ah)", startAyat: 1, endAyat: 11 },
      { nama: "المنافقون (Al-Munāfiqūn)", startAyat: 1, endAyat: 11 },
      { nama: "التغابن (At-Taghābun)", startAyat: 1, endAyat: 18 },
      { nama: "الطلاق (Aṭ-Ṭalāq)", startAyat: 1, endAyat: 12 },
      { nama: "التحريم (At-Taḥrīm)", startAyat: 1, endAyat: 12 }
    ]
  },
  {
    juz: 29,
    surahs: [
      { nama: "الملك (Al-Mulk)", startAyat: 1, endAyat: 30 },
      { nama: "القلم (Al-Qalam)", startAyat: 1, endAyat: 52 },
      { nama: "الحاقة (Al-Ḥāqqah)", startAyat: 1, endAyat: 52 },
      { nama: "المعارج (Al-Ma‘ārij)", startAyat: 1, endAyat: 44 },
      { nama: "نوح (Nūḥ)", startAyat: 1, endAyat: 28 },
      { nama: "الجن (Al-Jinn)", startAyat: 1, endAyat: 28 },
      { nama: "المزمل (Al-Muzzammil)", startAyat: 1, endAyat: 20 },
      { nama: "المدثر (Al-Muddaththir)", startAyat: 1, endAyat: 56 },
      { nama: "القيامة (Al-Qiyāmah)", startAyat: 1, endAyat: 40 },
      { nama: "الإنسان (Al-Insān)", startAyat: 1, endAyat: 31 },
      { nama: "المرسلات (Al-Mursalāt)", startAyat: 1, endAyat: 50 }
    ]
  },
  {
    juz: 30,
    surahs: [
      { nama: "النبأ (An-Naba’)", startAyat: 1, endAyat: 40 },
      { nama: "النازعات (An-Nāzi‘āt)", startAyat: 1, endAyat: 46 },
      { nama: "عبس (‘Abasa)", startAyat: 1, endAyat: 42 },
      { nama: "التكوير (At-Takwīr)", startAyat: 1, endAyat: 29 },
      { nama: "الانفطار (Al-Infiṭār)", startAyat: 1, endAyat: 19 },
      { nama: "المطففين (Al-Muṭaffifīn)", startAyat: 1, endAyat: 36 },
      { nama: "الانشقاق (Al-Inshiqāq)", startAyat: 1, endAyat: 25 },
      { nama: "البروج (Al-Burūj)", startAyat: 1, endAyat: 22 },
      { nama: "الطارق (Aṭ-Ṭāriq)", startAyat: 1, endAyat: 17 },
      { nama: "الأعلى (Al-A‘lā)", startAyat: 1, endAyat: 19 },
      { nama: "الغاشية (Al-Ghāshiyah)", startAyat: 1, endAyat: 26 },
      { nama: "الفجر (Al-Fajr)", startAyat: 1, endAyat: 30 },
      { nama: "البلد (Al-Balad)", startAyat: 1, endAyat: 20 },
      { nama: "الشمس (Ash-Shams)", startAyat: 1, endAyat: 15 },
      { nama: "الليل (Al-Layl)", startAyat: 1, endAyat: 21 },
      { nama: "الضحى (Aḍ-Ḍuḥā)", startAyat: 1, endAyat: 11 },
      { nama: "الشرح (Ash-Sharḥ)", startAyat: 1, endAyat: 8 },
      { nama: "التين (At-Tīn)", startAyat: 1, endAyat: 8 },
      { nama: "العلق (Al-‘Alaq)", startAyat: 1, endAyat: 19 },
      { nama: "القدر (Al-Qadr)", startAyat: 1, endAyat: 5 },
      { nama: "البينة (Al-Bayyinah)", startAyat: 1, endAyat: 8 },
      { nama: "الزلزلة (Az-Zalzalah)", startAyat: 1, endAyat: 8 },
      { nama: "العاديات (Al-‘Ādiyāt)", startAyat: 1, endAyat: 11 },
      { nama: "القارعة (Al-Qāri‘ah)", startAyat: 1, endAyat: 11 },
      { nama: "التكاثر (At-Takāthur)", startAyat: 1, endAyat: 8 },
      { nama: "العصر (Al-‘Aṣr)", startAyat: 1, endAyat: 3 },
      { nama: "الهمزة (Al-Humazah)", startAyat: 1, endAyat: 9 },
      { nama: "الفيل (Al-Fīl)", startAyat: 1, endAyat: 5 },
      { nama: "قريش (Quraysh)", startAyat: 1, endAyat: 4 },
      { nama: "الماعون (Al-Mā‘ūn)", startAyat: 1, endAyat: 7 },
      { nama: "الكوثر (Al-Kawthar)", startAyat: 1, endAyat: 3 },
      { nama: "الكافرون (Al-Kāfirūn)", startAyat: 1, endAyat: 6 },
      { nama: "النصر (An-Naṣr)", startAyat: 1, endAyat: 3 },
      { nama: "المسد (Al-Masad)", startAyat: 1, endAyat: 5 },
      { nama: "الإخلاص (Al-Ikhlāṣ)", startAyat: 1, endAyat: 4 },
      { nama: "الفلق (Al-Falaq)", startAyat: 1, endAyat: 5 },
      { nama: "الناس (An-Nās)", startAyat: 1, endAyat: 6 }
    ]
  }
];
