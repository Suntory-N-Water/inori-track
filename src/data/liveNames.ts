/** ライブ名マスタデータ */
export const liveNames = [
  {
    id: '1st-live-ready-steady-go',
    name: '1st LIVE Ready Steady Go!',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: 'live-tour-2018-blue-compass',
    name: 'LIVE TOUR 2018 BLUE COMPASS',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: 'live-tour-2019-catch-the-rainbow',
    name: 'LIVE TOUR 2019 Catch the Rainbow!',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: '5th-anniversary-live-starry-wishes',
    name: '5th ANNIVERSARY LIVE Starry Wishes',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: 'live-tour-2021-hello-horizon',
    name: 'LIVE TOUR 2021 HELLO HORIZON',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: 'live-tour-2022-glow',
    name: 'LIVE TOUR 2022 glow',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: 'live-tour-2023-scrap-art',
    name: 'LIVE TOUR 2023 SCRAP ART',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: 'live-tour-2024-heart-bookmark',
    name: 'LIVE TOUR 2024 heart bookmark',
    liveType: '水瀬いのり個人名義',
  },
  {
    id: 'inorimachi-town-meeting-2018',
    name: 'いのりまち町民集会2018',
    liveType: '町民集会',
  },
  {
    id: 'inorimachi-town-meeting-2019',
    name: 'いのりまち町民集会2019',
    liveType: '町民集会',
  },
  {
    id: 'inorimachi-town-meeting-2021-second-helping',
    name: 'いのりまち町民集会2021-おかわり-',
    liveType: '町民集会',
  },
  {
    id: 'inorimachi-town-meeting-2023',
    name: 'いのりまち町民集会2023',
    liveType: '町民集会',
  },
  {
    id: 'inorimachi-town-meeting-2024-acoustic-live-wonder-caravan!-',
    name: 'いのりまち町民集会2024 -ACOUSTIC LIVE Wonder Caravan！-',
    liveType: '町民集会',
  },
  {
    id: 'inorimachi-town-meeting-2025-acoustic-live-cinemati-diary-',
    name: 'いのりまち町民集会2025 -ACOUSTIC LIVE シネマチックダイアリー-',
    liveType: '町民集会',
  },
  {
    id: 'live-tour-2025-travel-record',
    name: 'Inori Minase 10th ANNIVERSARY LIVE TOUR Travel Record',
    liveType: '水瀬いのり個人名義',
  },
] as const;

export type LiveNameId = (typeof liveNames)[number]['id'];
