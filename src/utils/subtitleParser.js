/**
 * Parse standard SRT or VTT subtitle text into timed cue objects:
 * [{ start: seconds, end: seconds, text: string }]
 */
export function parseSrtOrVtt(content) {
  if (!content) return [];
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const cues = [];
  let i = 0;

  const timeRegex = /(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})/;

  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(timeRegex);

    if (match) {
      const startH = parseInt(match[1] || '0', 10);
      const startM = parseInt(match[2], 10);
      const startS = parseInt(match[3], 10);
      const startMs = parseInt(match[4], 10);

      const endH = parseInt(match[5] || '0', 10);
      const endM = parseInt(match[6], 10);
      const endS = parseInt(match[7], 10);
      const endMs = parseInt(match[8], 10);

      const start = startH * 3600 + startM * 60 + startS + startMs / 1000;
      const end = endH * 3600 + endM * 60 + endS + endMs / 1000;

      i++;
      let text = '';
      while (i < lines.length && lines[i].trim() !== '') {
        text += (text ? '\n' : '') + lines[i].trim();
        i++;
      }

      // Strip VTT tags like <v ...> or <b>
      text = text.replace(/<[^>]+>/g, '');
      cues.push({ start, end, text });
    }
    i++;
  }

  return cues;
}

/**
 * Built-in synchronized subtitles for cinema films across languages
 */
export const CINEMA_SUBTITLES = {
  // English [CC]
  'English [CC]': [
    { start: 0.5, end: 4.0, text: 'KIRTAN CINEMA PRESENTS' },
    { start: 4.5, end: 9.0, text: 'Recorded in Native 4K UHD with Dolby Atmos Object Audio' },
    { start: 9.5, end: 14.2, text: '[Nathan] All telemetry systems are calibrated. Approaching the gravitational core.' },
    { start: 14.8, end: 18.5, text: '[Anya] Reading extreme energy displacement at Sagittarius A* coordinates.' },
    { start: 19.0, end: 23.2, text: '[Synthetics Officer] Warning: Gravitational distortion exceeding safety thresholds.' },
    { start: 23.8, end: 28.0, text: '[Nathan] Steady the thrusters. We came too far across the void to turn back now.' },
    { start: 29.0, end: 34.5, text: '[Anya] Look at the horizon... the light, it is bending backwards into itself!' },
    { start: 35.0, end: 40.0, text: '[Orchestral crescendo resonating in Dolby Atmos 7.1]' },
    { start: 41.0, end: 46.5, text: '[Nathan] Decouple secondary shields. We are crossing into the megastructure.' },
    { start: 47.0, end: 53.0, text: '[Beacon AI] Welcome back, travelers. The chronicle of your species awaits.' },
    { start: 54.0, end: 60.0, text: '[Sub-bass pulse vibrating through the hull]' },
    { start: 61.0, end: 68.0, text: '[Nathan] Prepare landing thrusters. We have made history today.' }
  ],

  // Hindi
  'Hindi': [
    { start: 0.5, end: 4.0, text: 'कीर्तन सिनेमा प्रस्तुत करता है' },
    { start: 4.5, end: 9.0, text: 'डॉल्बी एटमॉस और 4K UHD मास्टर प्रारूप में' },
    { start: 9.5, end: 14.2, text: '[नाथन] सभी सिस्टम स्थिर हैं। हम गुरुत्वाकर्षण केंद्र के पास पहुंच रहे हैं।' },
    { start: 14.8, end: 18.5, text: '[अन्या] निर्देशांकों पर अत्यधिक ऊर्जा तरंगे दिखाई दे रही हैं।' },
    { start: 19.0, end: 23.2, text: '[अधिकारी] चेतावनी: गुरुत्वाकर्षण खिंचाव सीमा से अधिक हो रहा है।' },
    { start: 23.8, end: 28.0, text: '[नाथन] थ्रस्टर्स संभालो! हम इतनी दूर वापस लौटने के लिए नहीं आए हैं।' },
    { start: 29.0, end: 34.5, text: '[अन्या] क्षितिज की ओर देखो... प्रकाश स्वयं में वापस मुड़ रहा है!' },
    { start: 35.0, end: 40.0, text: '[सिनेमैटिक संगीत डॉल्बी एटमॉस में गूंजता हुआ]' },
    { start: 41.0, end: 46.5, text: '[नाथन] शील्ड्स तैयार करो। हम संरचना के अंदर प्रवेश कर रहे हैं।' },
    { start: 47.0, end: 53.0, text: '[एआई] आपका स्वागत है, अंतरिक्ष यात्रियों। आपका इतिहास यहीं सुरक्षित है।' },
    { start: 54.0, end: 60.0, text: '[गहरा बेस कंपन जहाज में महसूस होता है]' },
    { start: 61.0, end: 68.0, text: '[नाथन] लैंडिंग की तैयारी करो। आज हमने एक नया इतिहास रचा है।' }
  ],

  // Spanish
  'Spanish': [
    { start: 0.5, end: 4.0, text: 'KIRTAN CINEMA PRESENTA' },
    { start: 4.5, end: 9.0, text: 'Masterizado en 4K UHD con sonido Dolby Atmos' },
    { start: 9.5, end: 14.2, text: '[Nathan] Todos los sistemas calibrados. Nos acercamos al núcleo.' },
    { start: 14.8, end: 18.5, text: '[Anya] Registrando desplazamiento extremo de energía.' },
    { start: 19.0, end: 23.2, text: '[Oficial] Advertencia: La distorsión gravitatoria supera los límites.' },
    { start: 23.8, end: 28.0, text: '[Nathan] Mantengan la posición. No hemos venido tan lejos para retroceder.' },
    { start: 29.0, end: 34.5, text: '[Anya] Miren el horizonte... la luz se está curvando hacia adentro.' },
    { start: 35.0, end: 40.0, text: '[Crescendo orquestal envolvente]' },
    { start: 41.0, end: 46.5, text: '[Nathan] Desacoplen escudos. Estamos entrando en la megaestructura.' },
    { start: 47.0, end: 53.0, text: '[IA] Bienvenidos, viajeros. El registro de su especie los espera.' }
  ],

  // French
  'French': [
    { start: 0.5, end: 4.0, text: 'KIRTAN CINÉMA PRÉSENTE' },
    { start: 4.5, end: 9.0, text: 'Enregistré en 4K UHD avec Dolby Atmos Spatial' },
    { start: 9.5, end: 14.2, text: '[Nathan] Tous les systèmes sont calibrés. Approche du noyau.' },
    { start: 14.8, end: 18.5, text: '[Anya] Déplacement d\'énergie extrême détecté.' },
    { start: 19.0, end: 23.2, text: '[Officier] Alerte: Distortion gravitationnelle critique.' },
    { start: 23.8, end: 28.0, text: '[Nathan] Maintenez le cap. Nous ne ferons pas demi-tour.' }
  ],

  // Japanese
  'Japanese': [
    { start: 0.5, end: 4.0, text: 'キルタン・シネマ プレゼンツ' },
    { start: 4.5, end: 9.0, text: 'ネイティブ4K UHD ドルビーアトモス音響' },
    { start: 9.5, end: 14.2, text: '[ネイサン] 全システム調整完了。重力コアに接近中。' },
    { start: 14.8, end: 18.5, text: '[アーニャ] 射手座A*座標で異常なエネルギー変位を検知。' },
    { start: 19.0, end: 23.2, text: '[AI] 警告：重力歪みが安全許容範囲を超過しています。' },
    { start: 23.8, end: 28.0, text: '[ネイサン] スラスター維持。引き返すつもりはない。' },
    { start: 29.0, end: 34.5, text: '[アーニャ] 地平線を見て…光が内部へと歪んでいます！' }
  ]
};

/**
 * Returns active cue for current timestamp considering offset in seconds
 */
export function getActiveCue(cues, currentTime, offsetSeconds = 0) {
  if (!cues || !Array.isArray(cues) || cues.length === 0) return null;
  const adjustedTime = currentTime + offsetSeconds;
  return cues.find((c) => adjustedTime >= c.start && adjustedTime <= c.end) || null;
}
