/// <reference path="../node_modules/@types/webaudioapi/index.d.ts" />

import { Subject } from 'rxjs';

const audio = new window.AudioContext;
export const beeper = new Subject();
beeper.sampleTime(100).subscribe((hz: number) => {
    const oscillator = audio.createOscillator();
    oscillator.connect(audio.destination);
    oscillator.type = 'square';
    oscillator.frequency.value = hz;
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.1);
});

